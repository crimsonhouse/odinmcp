export class SessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // in-memory cache
    this.SESSION_TTL = 1000 * 60 * 30; // 30 minutes
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Create a session
    if (request.method === "POST" && path === "/create") {
      const body = await request.json();
      const sessionId = crypto.randomUUID();
      const now = Date.now();

      const sessionData = {
        data: body,
        createdAt: now,
        expiresAt: now + this.SESSION_TTL,
      };

      this.sessions.set(sessionId, sessionData);
      await this.state.storage.put(sessionId, sessionData);

      return new Response(JSON.stringify({ sessionId }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get a session
    if (request.method === "GET" && path.startsWith("/get/")) {
      const sessionId = path.split("/get/")[1];
      let sessionData = this.sessions.get(sessionId);

      if (!sessionData) {
        sessionData = await this.state.storage.get(sessionId);
        if (sessionData) this.sessions.set(sessionId, sessionData);
      }

      if (!sessionData) {
        return new Response("Session not found", { status: 404 });
      }

      if (Date.now() > sessionData.expiresAt) {
        this.sessions.delete(sessionId);
        await this.state.storage.delete(sessionId);
        return new Response("Session expired", { status: 410 });
      }

      return new Response(JSON.stringify(sessionData), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Renew a session
    if (request.method === "PUT" && path.startsWith("/renew/")) {
      const sessionId = path.split("/renew/")[1];
      let sessionData = this.sessions.get(sessionId);

      if (!sessionData) {
        sessionData = await this.state.storage.get(sessionId);
        if (sessionData) this.sessions.set(sessionId, sessionData);
      }

      if (!sessionData) {
        return new Response("Session not found", { status: 404 });
      }

      if (Date.now() > sessionData.expiresAt) {
        this.sessions.delete(sessionId);
        await this.state.storage.delete(sessionId);
        return new Response("Session expired", { status: 410 });
      }

      // Extend expiry
      sessionData.expiresAt = Date.now() + this.SESSION_TTL;
      this.sessions.set(sessionId, sessionData);
      await this.state.storage.put(sessionId, sessionData);

      return new Response(JSON.stringify({
        renewed: true,
        expiresAt: sessionData.expiresAt
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Delete a session
    if (request.method === "DELETE" && path.startsWith("/delete/")) {
      const sessionId = path.split("/delete/")[1];
      this.sessions.delete(sessionId);
      await this.state.storage.delete(sessionId);

      return new Response("Session deleted");
    }

    // List all active sessions
    if (request.method === "GET" && path === "/list") {
      const now = Date.now();
      const activeSessions = [];

      // Ensure expired sessions are removed
      for (let [id, session] of this.sessions.entries()) {
        if (session.expiresAt > now) {
          activeSessions.push({ id, ...session });
        } else {
          this.sessions.delete(id);
          await this.state.storage.delete(id);
        }
      }

      return new Response(JSON.stringify(activeSessions), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
