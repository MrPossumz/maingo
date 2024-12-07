import type { Catalog } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import NoAuth from "./no-auth.ts";

Deno.test("NoAuth", async () => {
  assertEquals(NoAuth.type, "none");

  const auth = new NoAuth<Catalog>({ auth: "none" });

  assert("getAuthentication" in auth);

  const authCallback = auth.getAuthentication();

  assertEquals(typeof authCallback, "function");

  const initialComponents = {
    body: {},
    params: [],
    headers: {},
  };

  const mappedComponents = await authCallback(() => initialComponents);

  assert("headers" in mappedComponents);
  assertEquals(mappedComponents.headers, initialComponents.headers);
  assert("body" in mappedComponents);
  assertEquals(mappedComponents.body, initialComponents.body);
  assert("params" in mappedComponents);
  assertEquals(mappedComponents.params, initialComponents.params);

  assert(Object.keys(initialComponents.body).length === 0);
  assert(Object.keys(initialComponents.headers).length === 0);
  assert(initialComponents.params.length === 0);
});
