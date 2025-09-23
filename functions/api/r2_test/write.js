export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // Check content-type header
    const contentType = request.headers.get("content-type") || "";

    let key, content, storedContent;

    if (contentType.includes("application/json")) {
      // Expect JSON: { "key": "file1.txt", "content": "Hello World" }
      const body = await request.json();
      key = body.key;
      content = body.content;

      if (!key || !content) {
        return new Response(
          JSON.stringify({ error: "Missing 'key' or 'content' in JSON body" }),
          { status: 400 }
        );
      }

      // Store just the plain content (not wrapped JSON)
      storedContent = content;
    } else {
      // Fallback: treat whole body as raw text
      const textBody = await request.text();

      // Simple rule: first word = key, rest = content
      // Example: "file1.txt Hello World"
      const firstSpace = textBody.indexOf(" ");
      if (firstSpace === -1) {
        return new Response(
          JSON.stringify({ error: "Plain text must be 'key content...'" }),
          { status: 400 }
        );
      }

      key = textBody.substring(0, firstSpace).trim();
      content = textBody.substring(firstSpace + 1).trim();
      storedContent = content;
    }

    // Save to R2 as plain text
    await env.MCP_EVIDENCE.put(key, storedContent, {
      httpMetadata: { contentType: "text/plain" },
    });

    return new Response(
      JSON.stringify({ status: "ok", key, stored: storedContent }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
