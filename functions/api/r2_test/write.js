export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => null);
    if (!body || !body.key || !body.content) {
      return new Response(
        JSON.stringify({ error: "Missing 'key' or 'content' in body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { key, content } = body;

    // Write object to R2
    await context.env.MCP_EVIDENCE.put(key, content);

    return new Response(
      JSON.stringify({
        ok: true,
        key,
        size: content.length,
        writtenAt: new Date().toISOString()
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Write failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
