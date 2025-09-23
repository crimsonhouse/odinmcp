export async function onRequestPost(context) {
  const url = new URL(context.request.url);

  // Always use the same DO instance "default"
  const id = context.env.SESSION_MANAGER.idFromName("default");
  const obj = context.env.SESSION_MANAGER.get(id);

  // Forward original request to DO
  return await obj.fetch(new Request(url.origin + "/session/set", {
    method: "POST",
    headers: context.request.headers,
    body: context.request.body
  }));
}
