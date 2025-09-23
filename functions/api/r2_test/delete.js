export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Missing 'key' query parameter" }),
        { status: 400 }
      );
    }

    // Check if the object exists first
    const obj = await env.MCP_EVIDENCE.get(key);
    if (!obj) {
      return new Response(
        JSON.stringify({ error: `Object '${key}' not found` }),
        { status: 404 }
      );
    }

    // Delete from bucket
    await env.MCP_EVIDENCE.delete(key);

    return new Response(
      JSON.stringify({ ok: true, deleted: key }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
