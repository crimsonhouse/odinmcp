export async function onRequestPost(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse request body
    let body;
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }

    let content = body.content;

    // If content is an object, stringify it before writing
    if (typeof content === "object") {
      content = JSON.stringify(content, null, 2);
    }

    if (typeof content !== "string") {
      return new Response(JSON.stringify({ error: "Content must be string or JSON object" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Write to R2
    await context.env.MCP_EVIDENCE.put(key, content);

    return new Response(
      JSON.stringify({ ok: true, key, written: content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
