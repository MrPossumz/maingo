import type { Catalog } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import BearerAuth from "./bearer.ts";

Deno.test("BearerAuth", async () => {
  assertEquals(BearerAuth.type, "bearer");

  const auth = new BearerAuth<Catalog>({
    auth: "bearer",
    token: "123",
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
  assertEquals(mappedComponents.headers.Authorization, `Bearer 123`);
});
