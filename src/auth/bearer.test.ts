import BearerAuth from "@/auth/bearer.ts";
import { assert, assertEquals, assertThrows } from "@std/assert";

Deno.test("BearerAuth - should throw an error for invalid config", () => {
  const invalidConfig = { token: 123 }; // Invalid token type

  assertThrows(
    () => new BearerAuth(invalidConfig as any),
    Error,
    "Invalid BearerAuthConfig provided",
  );
});

Deno.test("BearerAuth - getAuthentication should add Authorization header", async () => {
  const validConfig = { token: "test-token" };
  const auth = new BearerAuth(validConfig);
  const middleware = auth.getAuthentication();

  const mockRequest = { headers: {} };
  const mockNext = async (req: any) => req;

  const result = await middleware(mockRequest, mockNext) as unknown as Request;

  assert("headers" in result);
  assert("authorization" in result.headers);
  assertEquals(result.headers.authorization, `Bearer ${validConfig.token}`);
});

Deno.test("BearerAuth - getAuthentication should preserve existing headers", async () => {
  const validConfig = { token: "test-token" };
  const auth = new BearerAuth(validConfig);
  const middleware = auth.getAuthentication();

  const mockRequest = { headers: { "Content-Type": "application/json" } };
  const mockNext = async (req: any) => req;

  const result = await middleware(mockRequest, mockNext);

  assert("headers" in result);
  assert("authorization" in result.headers);
  assertEquals(result.headers["authorization"], `Bearer ${validConfig.token}`);
  assert("Content-Type" in result.headers);
  assertEquals(result.headers["Content-Type"], "application/json");
});
