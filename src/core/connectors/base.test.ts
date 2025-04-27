import { assertEquals } from "@std/assert";
import { mockFetch } from "@/utils/testing.ts";
import { ConnectorBase } from "./base.ts";

Deno.test("ConnectorBase - setHeader and removeHeader", () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => []);
  connector.setHeader("Authorization", "Bearer token");
  assertEquals(connector.headers.get("Authorization"), "Bearer token");

  connector.removeHeader("Authorization");
  assertEquals(connector.headers.get("Authorization"), null);
});

Deno.test("ConnectorBase - buildUrl with delimited params", () => {
  const connector = new ConnectorBase(
    { hostname: "https://example.com", searchParamFormat: "delimited" },
    () => [],
  );
  const url = connector["buildUrl"]("api/resource", { ids: ["1", "2", "3"] });
  assertEquals(decodeURIComponent(url.toString()), "https://example.com/api/resource?ids=1,2,3");
});

Deno.test("ConnectorBase - buildUrl with indexed params", () => {
  const connector = new ConnectorBase(
    { hostname: "https://example.com", searchParamFormat: "indexed" },
    () => [],
  );
  const url = connector["buildUrl"]("api/resource", { ids: ["1", "2", "3"] });
  assertEquals(
    decodeURIComponent(url.toString()),
    "https://example.com/api/resource?ids[0]=1&ids[1]=2&ids[2]=3",
  );
});

Deno.test("ConnectorBase - buildBody with JSON object", () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => []);
  const body = connector["buildBody"]({ key: "value" });
  assertEquals(body, JSON.stringify({ key: "value" }));
});

Deno.test("ConnectorBase - buildBody with undefined body", () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => []);
  const body = connector["buildBody"](undefined);
  assertEquals(body, undefined);
});

Deno.test("ConnectorBase - preRequest constructs request correctly", async () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => []);
  const request = connector["preRequest"]({
    endpoint: "api/resource",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { key: "value" },
  });

  assertEquals(request.method, "POST");
  assertEquals(request.url, "https://example.com/api/resource");
  assertEquals(request.headers.get("Content-Type"), "application/json");
  assertEquals(await request.text(), JSON.stringify({ key: "value" }));
});

Deno.test("ConnectorBase - request calls middleware and fetch", async () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => [
    async (req, next) => {
      req.headers = { ...req.headers, "X-Test": "middleware" };
      return next(req);
    },
  ]);

  const stubObj = mockFetch((req) => {
    assertEquals(req.url, "https://example.com/api/resource");
    assertEquals(req.headers.get("X-Test"), "middleware");
    return Promise.resolve(new Response("OK", { status: 200 }));
  });

  const response = await connector.request({
    endpoint: "api/resource",
    method: "GET",
  });

  assertEquals(await response.text(), "OK");

  stubObj.restore();
});

Deno.test("ConnectorBase - refire retries the request", async () => {
  const connector = new ConnectorBase({ hostname: "https://example.com" }, () => []);
  let attempt = 0;

  const stubObj = mockFetch((req) => {
    attempt++;
    if (attempt === 1) {
      return Promise.resolve(new Response("First attempt failed", { status: 500 }));
    }
    return Promise.resolve(new Response("Second attempt succeeded", { status: 200 }));
  });

  const response = await connector.request({
    endpoint: "api/resource",
    method: "GET",
  });

  assertEquals(await response.text(), "First attempt failed");
  assertEquals(response.status, 500);

  const refiredResponse = await response.refire();
  assertEquals(await refiredResponse.text(), "Second attempt succeeded");
  assertEquals(refiredResponse.status, 200);

  stubObj.restore();
});

