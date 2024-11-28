import type { RequestComponents, ResponseJson, ResponseText } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import { expectTypeOf } from "expect-type";
import { Client, createClient } from "@/client.ts";
import { REST } from "./rest.ts";

type RestLib = {
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
        headers: { "content-type": "application/json" };
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
      // request: Record<string | number | symbol, never>,
      response: ResponseText<"Test">;
      errors: Record<string, never>;
    };
  };
};

Deno.test("REST", async (t) => {
  assertEquals(REST.type, "REST");

  await t.step("is resolved by client", () => {
    const client = createClient<RestLib>()({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    assert(client instanceof Client);
    assert(client.connector instanceof REST);
  });

  await t.step("binds methods to client", () => {
    const client = createClient<RestLib>()({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    assert("head" in client);
    assert("head" in client.connector);
    assert("get" in client);
    assert("get" in client.connector);
    assert("post" in client);
    assert("post" in client.connector);
    assert("patch" in client);
    assert("patch" in client.connector);
    assert("put" in client);
    assert("put" in client.connector);
    assert("delete" in client);
    assert("delete" in client.connector);
    assert("options" in client);
    assert("options" in client.connector);

    expectTypeOf<typeof client.head>().toMatchTypeOf<typeof client.connector.head>();
    expectTypeOf<typeof client.get>().toMatchTypeOf<typeof client.connector.get>();
    expectTypeOf<typeof client.post>().toMatchTypeOf<typeof client.connector.post>();
    expectTypeOf<typeof client.patch>().toMatchTypeOf<typeof client.connector.patch>();
    expectTypeOf<typeof client.put>().toMatchTypeOf<typeof client.connector.put>();
    expectTypeOf<typeof client.delete>().toMatchTypeOf<typeof client.connector.delete>();
    expectTypeOf<typeof client.options>().toMatchTypeOf<typeof client.connector.options>();
  });

  await t.step("restricts defined endpoints", () => {
    const client = createClient<RestLib>()({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    expectTypeOf<typeof client.post<"/auth/login">>().parameters.toEqualTypeOf<
      [
        "/auth/login",
        RestLib["/auth/login"]["post"]["request"]["body"],
        RestLib["/auth/login"]["post"]["request"]["params"],
        RestLib["/auth/login"]["post"]["request"]["headers"],
      ]
    >();

    expectTypeOf<typeof client.post<"/organizations/tracks">>().parameters.toEqualTypeOf<
      [
        "/organizations/tracks",
        RestLib["/organizations/tracks"]["post"]["request"]["body"],
        undefined,
        RestLib["/organizations/tracks"]["post"]["request"]["headers"],
      ]
    >();

    expectTypeOf<typeof client.get<"/organizations/tracks">>().parameters.toEqualTypeOf<
      [
        "/organizations/tracks",
        RestLib["/organizations/tracks"]["get"]["request"]["params"],
        RestLib["/organizations/tracks"]["get"]["request"]["headers"],
      ]
    >();

    expectTypeOf<typeof client.put<"/organizations/tracks">>().parameters.toEqualTypeOf<
      ["/organizations/tracks", body?: undefined, params?: undefined, headers?: undefined]
    >();
  });

  await t.step("does not restrict undefined endpoints", () => {
    const client = createClient<RestLib>()({
      connector: "REST",
      hostname: "http://www.test.com",
      auth: "basic",
      userId: "test",
      userPass: "word",
    });

    expectTypeOf(client.post).parameter(1).toMatchTypeOf<
      RequestComponents["body"] | undefined
    >();
    expectTypeOf(client.post).parameter(2).toMatchTypeOf<
      RequestComponents["params"] | undefined
    >();
    expectTypeOf(client.post).parameter(3).toMatchTypeOf<
      RequestComponents["headers"] | undefined
    >();

		expectTypeOf(client.put).parameter(1).toMatchTypeOf<
		RequestComponents["body"] | undefined
	>();
	expectTypeOf(client.put).parameter(2).toMatchTypeOf<
		RequestComponents["params"] | undefined
	>();
	expectTypeOf(client.put).parameter(3).toMatchTypeOf<
		RequestComponents["headers"] | undefined
	>();

    expectTypeOf(client.get).parameter(1).toMatchTypeOf<
      RequestComponents["params"] | undefined
    >();
    expectTypeOf(client.get).parameter(2).toMatchTypeOf<
      RequestComponents["headers"] | undefined
    >();
  });
});
