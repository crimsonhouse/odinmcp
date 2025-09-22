// Handles base test and PUT to write an object
export async function onRequest(context) {
  const method = context.request.method;

  if (method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, message: "R2 test function is reachable" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  if (method === "PUT") {
    const testContent = "Hello from R2 at " + new Date().toISOString();
    await context.env.ODIN_BUCKET.put("test.txt", testContent);

    return new Response(
      JSON.stringify({ ok: true, written: testContent }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}
