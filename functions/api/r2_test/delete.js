export async function onRequestDelete(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Missing 'key' query parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete object from R2
    await context.env.MCP_EVIDENCE.delete(key);

    return new Response(
      JSON.stringify({
        ok: true,
        deleted: key,
        deletedAt: new Date().toISOString()
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Delete failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
