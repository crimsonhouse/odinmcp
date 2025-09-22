export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const path = url.pathname;

  // Route: GET /api/r2_test
  if (method === "GET" && path.endsWith("/api/r2_test")) {
    return new Response(
      JSON.stringify({ ok: true, message: "R2 test function is reachable" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Route: GET /api/r2_test/read
  if (method === "GET" && path.endsWith("/api/r2_test/read")) {
    const obj = await context.env.MCP_EVIDENCE.get("test.txt");
    if (!obj) {
      return new Response(JSON.stringify({ error: "Object not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await obj.text();
    return new Response(JSON.stringify({ content: body }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Route: PUT /api/r2_test
  if (method === "PUT" && path.endsWith("/api/r2_test")) {
    const testContent = "Hello from R2 at " + new Date().toISOString();
    await context.env.MCP_EVIDENCE.put("test.txt", testContent);

    return new Response(
      JSON.stringify({ ok: true, written: testContent }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  // Default fallback
  return new Response(
    JSON.stringify({ error: "Route not found or method not allowed" }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
}
