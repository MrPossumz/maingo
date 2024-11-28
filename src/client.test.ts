import { Client, createClient } from "./client.ts";
import { assert } from "@std/assert";
import type { ResponseJson, ResponseText } from "@/types.ts";

type TestLib = {
  "/auth/login": {
    post: {
      request: {
        params: { "test": "true" };
        body: FormData;
        headers: [];
      };
      response: ResponseJson<{ a: "test" }>;
      errors: Record<string, never>;
    };
  };
  "/organizations/tracks": {
    post: {
      request: {
        // headers: { 'content-type': 'application/json' };
        body: { name: string; num: number };
      };
      response: ResponseJson<{ test: true }>;
      errors: Record<string, never>;
    };
    get: {
      request: { params: { name: string }; headers: { "x-user-id": string } };
      response: ResponseText<`Some text: ${string}`>;
      errors: Record<string, never>;
    };
    put: {
      response: ResponseText<"Test">;
      errors: Record<string, never>;
    };
  };
};

Deno.test("createClient", async (t) => {
  await t.step("instantiates Client with Library", () => {
    const client = createClient<TestLib>()({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    assert(client instanceof Client);
  });

  await t.step("instantiates Client without Library", () => {
    const client = createClient({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    assert(client instanceof Client);
  });
});
