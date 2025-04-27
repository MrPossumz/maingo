import { Client, createClient } from "./client.ts";
import { assertEquals } from "@std/assert/equals";
import { assert } from "@std/assert";
import { GraphqlConnector } from "@/core/connectors/graphql.ts";
import { RestConnector } from "@/core/connectors/rest.ts";
import type { Middleware } from "@/core/middleware-stack.ts";

Deno.test("Client - initializes with default config values", () => {
  const client = createClient({
    connector: "rest",
    headers: { "Content-Type": "application/json" },
    hostname: "https://api.example.com",
  });

  assertEquals(client.middleware.length, 0);
  assertEquals(client.hasMiddleware("auth"), false);
});

Deno.test("Client - initializes with custom auth config", () => {
  const client = createClient({
    connector: "rest",
    headers: { "Content-Type": "application/json" },
    hostname: "https://api.example.com",
    auth: { type: "basic", id: "user", secret: "pass" },
  });

  assertEquals(client.middleware.length, 0);
  assert(client.hasMiddleware("auth"));
});

Deno.test("Client - adds and retrieves middleware", () => {
  const client = createClient({
    connector: "rest",
    headers: { "Content-Type": "application/json" },
    hostname: "https://api.example.com",
  });

  const middleware: Middleware = (req, next) => next(req);
  const key = client.useMiddleware(middleware, "testMiddleware");

  assert(client.hasMiddleware("testMiddleware"));
  assertEquals(client.getMiddleware("testMiddleware"), middleware);

  client.removeMiddleware(key);
  assertEquals(client.hasMiddleware("testMiddleware"), false);
});

Deno.test("createClient initializes a REST client", () => {
  const client = createClient({
    connector: "rest",
    headers: { "Content-Type": "application/json" },
    hostname: "https://api.example.com",
  });

  assert(client instanceof Client);
  assert(client["connector"] instanceof RestConnector);
});

Deno.test("createClient initializes a GraphQL client", () => {
  const client = createClient({
    connector: "graphql",
    endpoint: undefined,
    hostname: "https://api.example.com/graphql",
    headers: { "Content-Type": "application/json" },
  });

  assert(client instanceof Client);
  assert(client["connector"] instanceof GraphqlConnector);
});

// Deno.test("Client init sets up auth middleware", async () => {
//   const client = new Client({
//     connector: "rest",
//     auth: { type: "apiKey", key: "test-key" },
//   });

//   await client.init();

//   assertEquals(client.middleware.length, 1);
//   assertEquals(client.hasMiddleware("auth"), true);
// });

// Deno.test("Client throws error for unsupported connector", () => {
//   assertThrows(
//     () => {
//       createClient({
//         connector: "unsupported" as any,
//       });
//     },
//     Error,
//     "Unsupported connector type",
//   );
// });

// Deno.test("Client handles fetch requests with middleware", async () => {
//   mockFetch((req) => {
//     return new Response(JSON.stringify({ success: true }), { status: 200 });
//   });

//   const client = new Client({
//     connector: "rest",
//   });

//   const response = await client.init();
//   assertEquals(response, undefined); // Assuming init doesn't return anything
// });
