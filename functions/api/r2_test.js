// File: /functions/api/r2_test.js
// Minimal R2 test for Cloudflare Pages Functions
// - requires you bound the R2 bucket binding name to MCP_EVIDENCE in Pages Settings -> Bindings

export default {
  async fetch(request, env) {
    try {
      // sanity-check the binding exists (helps debug if binding name mismatch)
      if (!env.MCP_EVIDENCE) {
        return new Response(JSON.stringify({
          ok: false,
          error: "R2 binding not found. Binding name must be MCP_EVIDENCE in Pages Settings -> Bindings."
        }), { status: 500, headers: { "Content-Type": "application/json" }});
      }

      const url = new URL(request.url);
      // route: /api/r2_test/upload  -> creates a small JSON object and returns the key
      if (url.pathname.endsWith("/upload")) {
        const key = `test/${Date.now()}.json`;
        const payload = { uploadedAt: Date.now(), note: "r2 test" };
        await env.MCP_EVIDENCE.put(key, JSON.stringify(payload));
        return new Response(JSON.stringify({ ok: true, key }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // route: /api/r2_test/download?key=<key> -> returns object body
      if (url.pathname.endsWith("/download")) {
        const key = url.searchParams.get("key");
        if (!key) return new Response(JSON.stringify({ error: "missing key" }), { status: 400, headers: { "Content-Type": "application/json" }});
        const object = await env.MCP_EVIDENCE.get(key);
        if (!object) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" }});
        // object.body may be an ArrayBuffer/ReadableStream; respond with JSON
        const text = await object.text();
        return new Response(text, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Default: return help
      return new Response(JSON.stringify({ ok: true, routes: ["/api/r2_test/upload", "/api/r2_test/download?key=<key>"] }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, message: err?.message || String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};
