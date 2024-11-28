import type { Catalog } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import OAuth2 from "./oauth2.ts";

Deno.test("OAuth2", async (t) => {
  assertEquals(OAuth2.type, "oauth2");

  // deno-lint-ignore no-explicit-any
  const mockClient: any = {};

  let accessTokenCount = 0;
  let refreshTokenCount = 0;

  const auth = new OAuth2<Catalog>({
    connector: "REST",
    hostname: "yes",
    auth: "oauth2",
    clientId: "client-id",
    clientSecret: "client-secret",
    grantType: "granted",
    accessTokenCallback: (client) => {
      assertEquals(client, mockClient);
      accessTokenCount++;
      return Promise.resolve({ accessToken: "access-token" });
    },
    refreshTokenCallback: (client) => {
      assertEquals(client, mockClient);
      refreshTokenCount++;
      return Promise.resolve({ accessToken: "access-token" });
    },
  });

  await t.step("assigns token to header", async () => {
    assert("getAuthentication" in auth);

    const authCallback = auth.getAuthentication(mockClient);

    assertEquals(typeof authCallback, "function");

    const initialComponents = {
      body: {},
      params: [],
      headers: {},
    };

    const mappedComponents = await authCallback(() => initialComponents);

    assert("headers" in mappedComponents);
    assert("Authorization" in mappedComponents.headers);
    assertEquals(mappedComponents.headers["Authorization"], "Bearer access-token");
    assertEquals(accessTokenCount, 1);
  });

  await t.step("caches the token", async () => {
    const authCallback = auth.getAuthentication(mockClient);

    assertEquals(typeof authCallback, "function");

    const initialComponents = {
      body: {},
      params: [],
      headers: {},
    };

    const mappedComponents = await authCallback(() => initialComponents);

    assert("headers" in mappedComponents);
    assert("Authorization" in mappedComponents.headers);
    assertEquals(mappedComponents.headers["Authorization"], "Bearer access-token");
    assertEquals(accessTokenCount, 1);
  });
});
