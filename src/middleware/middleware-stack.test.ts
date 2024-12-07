import { assert, assertEquals } from "@std/assert";
import MiddlewareStack from "@/middleware/middleware-stack.ts";

Deno.test("request-tap", async (t) => {
  const stack = new MiddlewareStack();
  const wasCalled: number[] = [];

  stack.tap("request", (next) => {
    next();
    wasCalled.push(1);
  });

  const removeTwo = stack.tap("request", (next) => {
    next();
    wasCalled.push(2);
  });

  stack.tap("request", (next) => {
    next();
    wasCalled.push(3);
  });

  await stack.applyRequestTap(new Request("http://test.com", {}), () => {});

  await t.step("applies", () => {
    assertEquals(wasCalled.length, 3);
    assert(wasCalled.includes(1));
    assert(wasCalled.includes(2));
    assert(wasCalled.includes(3));
  });

  await t.step("applies in order of addition", () => {
    assertEquals(wasCalled[0], 1);
    assertEquals(wasCalled[1], 2);
    assertEquals(wasCalled[2], 3);
  });

  await t.step("remove tap", () => {
    while (wasCalled.length) wasCalled.pop();

    removeTwo();

    stack.applyRequestTap(new Request("http://test.com", {}), () => {});

    assertEquals(wasCalled.length, 2);
    assert(wasCalled.includes(1));
    assert(wasCalled.includes(3));

    assertEquals(wasCalled[0], 1);
    assertEquals(wasCalled[1], 3);
  });
});

Deno.test("request-map", async (t) => {
  const stack = new MiddlewareStack();

  const components = () => ({
    body: [],
    params: null,
    headers: {},
  });

  stack.push("request", async (next) => {
    const components = await next();
    (components.body as number[]).push(1);

    return components;
  });

  const stackTwo = stack.push("request", async (next) => {
    const components = await next();
    (components.body as number[]).push(2);

    return components;
  });

  stack.push("request", async (next) => {
    const components = await next();
    (components.body as number[]).push(3);

    return components;
  });

  await t.step("applies map", async () => {
    const { body } = await stack.applyRequestMap(components());

    assert(Array.isArray(body));
    assertEquals(body.length, 3);

    assert(body.includes(1));
    assert(body.includes(2));
    assert(body.includes(3));
  });

  await t.step("remove request middleware", async () => {
    stackTwo();
    const { body } = await stack.applyRequestMap(components());

    assert(Array.isArray(body));
    assertEquals(body.length, 2);

    assert(body.includes(1));
    assert(body.includes(3));
  });
});

Deno.test("response-map", async (t) => {
  const stack = new MiddlewareStack();

  stack.push("response", async (next) => {
    const res = await next();
    const body: number[] = await res.json();

    body.push(1);
    return new Response(JSON.stringify(body));
  });

  const stackTwo = stack.push("response", async (next) => {
    const res = await next();
    const body: number[] = await res.json();

    body.push(2);
    return new Response(JSON.stringify(body));
  });

  stack.push("response", async (next) => {
    const res = await next();
    const body: number[] = await res.json();

    body.push(3);
    return new Response(JSON.stringify(body));
  });

  await t.step("applies map", async () => {
    const initialReq = new Request("http://www.test.com");
    const initialRes = new Response(JSON.stringify([]));

    const newRes = await stack.applyResponseMap(initialReq, initialRes);

    assert("json" in newRes);

    const res = await newRes.json();

    assert(Array.isArray(res));
    assert(res.includes(1));
    assert(res.includes(2));
    assert(res.includes(3));
  });

  await t.step("removes response middleware", async () => {
    stackTwo();
    const initialReq = new Request("http://www.test.com");
    const initialRes = new Response(JSON.stringify([]));

    const newRes = await stack.applyResponseMap(initialReq, initialRes);

    assert("json" in newRes);

    const res = await newRes.json();

    assert(Array.isArray(res));
    assert(res.includes(1));
    assert(res.includes(3));
  });
});
