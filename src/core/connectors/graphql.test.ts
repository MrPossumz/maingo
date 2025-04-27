import { assert, assertEquals } from "@std/assert";
import { mockFetch } from "@/utils/testing.ts";
import { GraphqlConnector } from "./graphql.ts";

Deno.test("GraphqlConnector - query sends a POST request to the configured endpoint", async () => {
  const mockResponse = new Response(JSON.stringify({ data: { message: "success" } }));
  const stubObj = mockFetch(mockResponse);

  const connector = new GraphqlConnector({ hostname: "https://example.com/graphql" }, () => []);
  const response = await connector.query({
    body: { query: "{ test }" },
    headers: { "Content-Type": "application/json" },
  });

  assertEquals(response, mockResponse);
  stubObj.restore();
});

Deno.test("GraphqlConnector - init binds methods to the client", () => {
  const client = {} as any;
  const connector = new GraphqlConnector({ hostname: "https://example.com/graphql" }, () => []);
  const extendedClient = connector.init(client);

  assert(typeof extendedClient.query === "function");
  assert(extendedClient.query !== connector.query);
});
