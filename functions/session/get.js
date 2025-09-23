// File: functions/session/get.js

export async function onRequestGet({ request, env }) {
  try {
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

