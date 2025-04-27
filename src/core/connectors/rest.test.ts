import { mockFetch } from "@/utils/testing.ts";
import { RestConnector } from "./rest.ts";
import { assert, assertEquals } from "@std/assert";

const methods = [
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "get",
] as const;

Deno.test("RestConnector - binds methods to the client", async (t) => {
  const connector = new RestConnector({
    hostname: "https://api.example.com",
    headers: {
      "Content-Type": "application/json",
    },
  }, () => []);

  const client = {} as any;
  const initializedClient = connector.init(client);

  for (const method of methods) {
    assert(typeof initializedClient[method] === "function");
    assert(initializedClient[method] !== connector[method]);
  }
});

Deno.test("RestConnector - methods", async (t) => {
  const connector = new RestConnector({
    hostname: "https://api.example.com",
    headers: {
      "Content-Type": "application/json",
    },
  }, () => []);

  await t.step("passes correct HTTP methods", async () => {
    for (const method of methods) {
      const stubObj = mockFetch((req) => {
        assertEquals(req?.method?.toLowerCase(), method);
        return Promise.resolve(new Response(`Mocked response for ${method}`));
      });

      await connector[method]({
        endpoint: "/test",
        headers: {},
        body: null,
        params: {},
      });

      stubObj.restore();
    }
  });

  await t.step("ignores passed in method", async () => {
    const stubObj = mockFetch((req) => {
      assertEquals(req?.method?.toLowerCase(), "get");
      return Promise.resolve(new Response("Mocked response for get"));
    });

    await connector.get({
      endpoint: "/test",
      headers: {},
      body: null,
      params: {},
      //@ts-expect-error
      method: "post",
    });

    stubObj.restore();
  });
});
