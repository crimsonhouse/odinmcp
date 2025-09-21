// File: /functions/api/session.js
// Durable Object: SessionManager
//
// Purpose:
// - Durable Object stores a small session object under key "session".
// - The Pages function forwards incoming requests to a SessionManager instance.
// - Endpoints:
//   POST  /api/session/set   -> body JSON => stored as session
//   GET   /api/session/get   -> returns {"session": ...}

export class SessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // initialize stored state safely
    this.state.blockConcurrencyWhile(async () => {
      const s = await this.state.storage.get("session");
      this.session = s || null;
    });
  }

  // handle requests routed to this Durable Object instance
  async fetch(request) {
    const url = new URL(request.url);
    // Use last path segment: expects /api/session/set or /api/session/get
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "";

    if (request.method === "POST" && last === "set") {
      const body = await request.json().catch(() => null);
      if (!body) return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "Content-Type": "application/json" }});
      await this.state.storage.put("session", body);
      this.session = body;
      return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" }});
    }

    if (request.method === "GET" && last === "get") {
      const stored = await this.state.storage.get("session");
      return new Response(JSON.stringify({ session: stored }), { headers: { "Content-Type": "application/json" }});
    }

    return new Response("Not found", { status: 404 });
  }
}

// Pages function entry — forward request to a named Durable Object instance
export default {
  async fetch(request, env) {
    // Choose DO instance by query param `id` (optional) or fallback to 'default'
    const url = new URL(request.url);
    const idName = url.searchParams.get("id") || "default";
    // IMPORTANT: binding name must match the binding you create later (SESSION_MANAGER)
    const id = env.SESSION_MANAGER.idFromName(idName);
    const obj = env.SESSION_MANAGER.get(id);
    // Forward the original request to the Durable Object instance
    return await obj.fetch(request);
  }
};
