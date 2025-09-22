// File: /functions/api/r2_test.js
// Purpose: simple endpoints to test R2 binding: /api/r2_test/upload and /api/r2_test/download?key=<key>

export default {
  async fetch(request, env) {
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
      // object.body is a ReadableStream / ArrayBuffer — returning it directly is fine
      return new Response(object.body, {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, routes: ["/api/r2_test/upload", "/api/r2_test/download?key=<key>"] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
