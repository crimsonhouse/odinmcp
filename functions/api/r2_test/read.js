// Handles GET /api/r2_test/read
export async function onRequestGet(context) {
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

    // Fetch object from R2
    const obj = await env.MCP_EVIDENCE.get(key);
    if (!obj) {
      return new Response(
        JSON.stringify({ error: `Object '${key}' not found` }),
        { status: 404 }
      );
    }

    const raw = await obj.text();

    // Try JSON parse — if it fails, fallback to plain text
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    return new Response(
      JSON.stringify({ key, content: parsed }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
