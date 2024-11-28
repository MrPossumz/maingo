import type { RequestComponents, ResponseJson, ResponseText } from "@/types.ts";
import { assert, assertEquals } from "@std/assert";
import { expectTypeOf } from "expect-type";
import { Client, createClient } from "@/client.ts";
import { Graphql } from "./graphql.ts";

type GApi = {
  "/auth/login": {
    query: {
      request: {
        body: FormData;
        params: [["test", "true"]];
        headers: [];
      };
      response: ResponseJson<{ a: "test" }>;
      errors: Record<string, never>;
    };
  };
  "/other": {
    query: {
      request: {
        body: [];
        params: [["test", "false"]];
        headers: { example: "new-header" };
      };
      response: ResponseText<"response">;
      errors: Record<string, never>;
    };
  };
};

Deno.test("Graphql", async (t) => {
  assertEquals(Graphql.type, "Graphql");

  await t.step("is resolved by Client", () => {
    const client = createClient<GApi>()({
      connector: "Graphql",
      hostname: "http://www.test.com",
      auth: "bearer",
      token: "abcdefg",
    });

    assert(client instanceof Client);
    assert(client.connector instanceof Graphql);

    expectTypeOf<typeof client.connector>().toMatchTypeOf<Graphql<GApi>>();
  });

  await t.step("binds methods to Client", () => {
    const client = createClient<GApi>()({
      connector: "Graphql",
      hostname: "http://www.test.com",
      auth: "bearer",
      token: "abcdefg",
    });

    assert("query" in client);
    assert("query" in client.connector);

    expectTypeOf<typeof client.query>().toMatchTypeOf<typeof client.connector.query>();
  });

  await t.step("restricts defined endpoints", () => {
    const client = createClient<GApi>()({
      connector: "Graphql",
      hostname: "http://www.test.com",
      auth: "bearer",
      token: "abcdefg",
    });

    expectTypeOf(client.query<"/auth/login">).parameter(0).toMatchTypeOf<"/auth/login">();
    expectTypeOf(client.query<"/auth/login">).parameter(1).toMatchTypeOf<
      GApi["/auth/login"]["query"]["request"]["body"]
    >();
    expectTypeOf(client.query<"/auth/login">).parameter(2).toMatchTypeOf<
      GApi["/auth/login"]["query"]["request"]["params"]
    >();
    expectTypeOf(client.query<"/auth/login">).parameter(3).toMatchTypeOf<
      GApi["/auth/login"]["query"]["request"]["headers"]
    >();

    expectTypeOf(client.query<"/other">).parameter(0).toMatchTypeOf<"/other">();
    expectTypeOf(client.query<"/other">).parameter(1).toMatchTypeOf<
      GApi["/other"]["query"]["request"]["body"]
    >();
    expectTypeOf(client.query<"/other">).parameter(2).toMatchTypeOf<
      GApi["/other"]["query"]["request"]["params"]
    >();
    expectTypeOf(client.query<"/other">).parameter(3).toMatchTypeOf<
      GApi["/other"]["query"]["request"]["headers"]
    >();
  });

  await t.step("does not restrict undefined endpoints", () => {
    const client = createClient<GApi>()({
      connector: "Graphql",
      hostname: "http://www.test.com",
      auth: "bearer",
      token: "abcdefg",
    });

    expectTypeOf(client.query).parameter(1).toMatchTypeOf<
      RequestComponents["body"] | undefined
    >();
    expectTypeOf(client.query).parameter(2).toMatchTypeOf<
      RequestComponents["params"] | undefined
    >();
    expectTypeOf(client.query).parameter(3).toMatchTypeOf<
      RequestComponents["headers"] | undefined
    >();
  });
});
