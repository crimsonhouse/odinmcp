// File: /functions/api/session/session_manager.js
// Durable Object: SessionManager

export class SessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Main fetch handler for this Durable Object
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Simple sanity check route
    if (path.endsWith("/ping")) {
      return new Response(
        JSON.stringify({ ok: true, message: "SessionManager is alive" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Default response
    return new Response(
      JSON.stringify({ error: "No route matched in SessionManager" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}
