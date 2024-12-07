import type { Catalog } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import BasicAuth from "./basic.ts";

Deno.test("BasicAuth", async () => {
  assertEquals(BasicAuth.type, "basic");

  const auth = new BasicAuth<Catalog>({
    auth: "basic",
    userId: "1",
    userPass: "2",
  });

  assert("getAuthentication" in auth);

  const authCallback = auth.getAuthentication();

  assertEquals(typeof authCallback, "function");

  const mappedComponents = await authCallback(() => ({
    body: {},
    params: [],
    headers: {},
  }));

  assert("headers" in mappedComponents);
  assert("Authorization" in mappedComponents.headers);
  assertEquals(mappedComponents.headers.Authorization, `Basic ${btoa("1:2")}`);
});
