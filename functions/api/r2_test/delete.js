export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await context.env.MCP_EVIDENCE.delete(key);

    return new Response(
      JSON.stringify({ ok: true, message: `Deleted ${key}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
