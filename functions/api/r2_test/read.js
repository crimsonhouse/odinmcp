export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const obj = await context.env.MCP_EVIDENCE.get(key);
    if (!obj) {
      return new Response(JSON.stringify({ error: "Object not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const raw = await obj.text();

    let content;
    try {
      // Try parsing JSON safely
      content = JSON.parse(raw);
    } catch {
      content = raw;
    }

    return new Response(
      JSON.stringify({ key, content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
