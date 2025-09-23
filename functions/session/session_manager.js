export class SessionManager {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get("session");
      this.session = stored || null;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname.endsWith("/set") && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await this.state.storage.put("session", body);
      this.session = body;

      return new Response(JSON.stringify({ ok: true, stored: body }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pathname.endsWith("/get") && request.method === "GET") {
      const stored = await this.state.storage.get("session");
      return new Response(JSON.stringify({ session: stored || null }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  }
}
