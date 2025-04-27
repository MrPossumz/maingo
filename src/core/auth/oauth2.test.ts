import { assert, assertEquals, assertThrows } from "@std/assert";
import type { Client } from "@/core/client.ts";
import OAuth2, { type OAuth2Config } from "./oauth2.ts";

Deno.test("OAuth2 - constructor throws error for invalid config", () => {
  assertThrows(
    // @ts-expect-error We're purposefully passing bad data
    () => Promise.resolve(new OAuth2({})),
    Error,
    "Invalid OAuth2Config provided",
  );
});

Deno.test("OAuth2 - getAuthentication adds Authorization header", async () => {
  const mockClient = {} as Client;
  const mockAccessToken = "mockAccessToken";
  const mockConfig: OAuth2Config = {
    clientId: "client-id",
    clientSecret: "client-secret",
    grantType: "client_credentials",
    accessTokenCallback: async () => ({
      accessToken: mockAccessToken,
    }),
    refreshTokenCallback: async () => ({
      accessToken: "newAccessToken",
    }),
  };

  const oauth2 = new OAuth2(mockConfig);
  const middleware = oauth2.getAuthentication(mockClient);

  const mockRequest = { headers: {} };
  const mockNext = async (req: any) => req;

  const result = await middleware(mockRequest, mockNext);

  assert(result);
  assert("headers" in result);
  assert("authorization" in result.headers);
  assertEquals(result.headers["authorization"], `Bearer ${mockAccessToken}`);
});

Deno.test("OAuth2 - getAccessToken caches token request", async () => {
  const mockClient = {} as Client;
  let callCount = 0;
  const mockConfig: OAuth2Config = {
    clientId: "client-id",
    clientSecret: "client-secret",
    grantType: "client_credentials",
    accessTokenCallback: async () => {
      callCount++;
      return { accessToken: "mockAccessToken" };
    },
    refreshTokenCallback: async () => ({
      accessToken: "newAccessToken",
    }),
  };

  const oauth2 = new OAuth2(mockConfig);

  const [token1, token2] = await Promise.all([
    oauth2["getAccessToken"](mockClient),
    oauth2["getAccessToken"](mockClient),
  ]);

  assertEquals(token1.accessToken, "mockAccessToken");
  assertEquals(token2.accessToken, "mockAccessToken");
  assertEquals(callCount, 1);
});

Deno.test("OAuth2 - refreshTokenCallback is used when token expires", async () => {
  const mockClient = {} as Client;
  const mockAccessToken = "expiredAccessToken";
  const mockNewAccessToken = "newAccessToken";
  const mockConfig: OAuth2Config = {
    clientId: "client-id",
    clientSecret: "client-secret",
    grantType: "client_credentials",
    accessTokenCallback: async () => ({
      accessToken: mockAccessToken,
			refreshToken: 'mockRefreshToken',
      expirationTimestamp: Date.now() - 1000, // Expired token
    }),
    refreshTokenCallback: async () => ({
      accessToken: mockNewAccessToken,
    }),
  };

  const oauth2 = new OAuth2(mockConfig);
  await oauth2["getAccessToken"](mockClient);

  const middleware = oauth2.getAuthentication(mockClient);
  const mockRequest = { headers: {} };
  const mockNext = async (req: any) => req;

  const result = await middleware(mockRequest, mockNext);

  assert(result);
  assert("headers" in result);
  assert("authorization" in result.headers);
  assertEquals(result.headers["authorization"], `Bearer ${mockNewAccessToken}`);
});
