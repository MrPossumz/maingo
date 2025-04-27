import { assert, assertEquals, assertThrows } from "@std/assert";
import BasicAuth from "./basic.ts";

Deno.test("BasicAuth - should encode credentials correctly", () => {
  const config = { id: "user", secret: "pass" };
  const auth = new BasicAuth(config);

  const expectedEncodedCredentials = btoa(`${config.id}:${config.secret}`);

  assertEquals(auth["encodedCredentials"], expectedEncodedCredentials);
});

Deno.test("BasicAuth - getAuthentication should add Authorization header", async () => {
  const config = { id: "user", secret: "pass" };
  const auth = new BasicAuth(config);
  const middleware = auth.getAuthentication();

  const mockRequest = {};
  const mockNext = async (req: any) => req;

  const result = await middleware(mockRequest, mockNext);

  assert("headers" in result);
  assert("authorization" in result.headers);
  assertEquals(result.headers.authorization, `Basic ${btoa(`${config.id}:${config.secret}`)}`);
});

Deno.test("BasicAuth - throws error on invalid config", () => {
  const invalidConfig = { id: "user" }; // Missing 'secret'

  assertThrows(
    () => new BasicAuth(invalidConfig as any),
    Error,
    "Invalid BasicAuthConfig provided",
  );
});
