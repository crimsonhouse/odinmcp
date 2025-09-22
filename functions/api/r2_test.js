// File: /functions/api/r2_test.js
//
// Purpose: Test Cloudflare R2 integration via Pages Functions.
// This endpoint supports:
//   GET  /api/r2_test  -> confirms the function is reachable
//   PUT  /api/r2_test  -> uploads a test object to R2
//   GET  /api/r2_test/read -> reads back the uploaded object
//
// Prerequisites:
// - You must have created an R2 bucket (e.g., "odin-bucket").
// - You must bind the bucket in Cloudflare Pages project settings:
//   Settings → Functions → R2 Bindings → Add binding
//   Binding name: ODIN_BUCKET
//   Bucket name: odin-bucket

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (path.endsWith("/read")) {
    // Try to read "test.txt" from R2
    const obj = await context.env.ODIN_BUCKET.get("test.txt");
    if (!obj) {
      return new Response(JSON.stringify({ error: "Object not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await obj.text();
    return new Response(JSON.stringify({ content: body }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Default GET endpoint
  return new Response(
    JSON.stringify({ ok: true, message: "R2 test function is reachable" }),
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function onRequestPut(context) {
  // Write a test object into R2
  const testContent = "Hello from R2 at " + new Date().toISOString();
  await context.env.ODIN_BUCKET.put("test.txt", testContent);

  return new Response(
    JSON.stringify({ ok: true, written: testContent }),
    { headers: { "Content-Type": "application/json" } }
  );
}
