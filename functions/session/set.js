// File: functions/session/set.js

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Pick an ID (default or ?id= query string)
    const url = new URL(request.url);
    const idName = url.searchParams.get("id") || "default";

    // Forward to Durable Object
    const id = env.SESSION_MANAGER.idFromName(idName);
    const obj = env.SESSION_MANAGER.get(id);

    return await obj.fetch(request);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

