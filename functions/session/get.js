export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  const id = context.env.SESSION_MANAGER.idFromName("default");
  const obj = context.env.SESSION_MANAGER.get(id);

  return await obj.fetch(new Request(url.origin + "/session/get", {
    method: "GET",
    headers: context.request.headers
  }));
}
