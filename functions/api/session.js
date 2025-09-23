export class SessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const method = request.method.toUpperCase();

    // Durable Object storage
    const storage = this.state.storage;

    if (method === "POST" && pathname.endsWith("/create")) {
      // Create new session
      const sessionId = crypto.randomUUID();
      const sessionData = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        data: {}
      };

      await storage.put(sessionId, sessionData);
      return new Response(JSON.stringify(sessionData), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (method === "GET" && pathname.endsWith("/get")) {
      const sessionId = searchParams.get("id");
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }

      const sessionData = await storage.get(sessionId);
      if (!sessionData) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }

      return new Response(JSON.stringify(sessionData), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (method === "POST" && pathname.endsWith("/update")) {
      const sessionId = searchParams.get("id");
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }

      const existing = await storage.get(sessionId);
      if (!existing) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }

      const body = await request.json();
      existing.data = { ...existing.data, ...body };
      existing.lastActive = new Date().toISOString();
      await storage.put(sessionId, existing);

      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (method === "DELETE" && pathname.endsWith("/delete")) {
      const sessionId = searchParams.get("id");
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      }

      await storage.delete(sessionId);
      return new Response(JSON.stringify({ deleted: sessionId }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Invalid route or method" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Export Pages Function entry
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = env.SESSION_MANAGER.idFromName("odin-global");
    const obj = env.SESSION_MANAGER.get(id);
    return obj.fetch(request);
  }
};
