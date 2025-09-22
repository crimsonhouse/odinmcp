// Handles GET /api/r2_test/read
export async function onRequestGet(context) {
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
