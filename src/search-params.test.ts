import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { SearchParams } from "@/search-params.ts";

function assertValidSearchParams(params: SearchParams, key: any, val: any) {
  assertInstanceOf(params, URLSearchParams);
  assert(params.has(key));
  assertEquals(params.get(key), val.toString());
}

Deno.test("instantiates", () => {
  assertInstanceOf(new SearchParams(), URLSearchParams);
});

Deno.test("Record<string, Stringable>", () => {
  const assertValidKeyVal = (key: any, val: any) =>
    assertValidSearchParams(new SearchParams({ [key]: val }), key, val);

  assertValidKeyVal("Authorization", "Bearer");
  assertValidKeyVal(5, "Bearer");
  assertValidKeyVal("Authorization", 5);
  assertValidKeyVal(1, 1);
  assertValidKeyVal("x-ref-token", ["Bearer"]);
});

Deno.test("[Stringable, Stringable][]", () => {
  const assertValidKeyVal = (key: any, val: any) =>
    assertValidSearchParams(new SearchParams([[key, val]]), key, val);

  assertValidKeyVal("Authorization", "Bearer");
  assertValidKeyVal(5, "Bearer");
  assertValidKeyVal("Authorization", 5);
  assertValidKeyVal(1, 1);
  assertValidKeyVal("x-ref-token", ["Bearer"]);
});

// Deno.test("string", () => {
//   const assertValidKeyVal = (key: any, val: any) =>
//     assertValidSearchParams(new SearchParams(`${key}: ${val}`), key, val);

//   assertValidKeyVal("Authorization", "Bearer");
//   assertValidKeyVal(5, "Bearer");
//   assertValidKeyVal("Authorization", 5);
//   assertValidKeyVal(1, 1);
//   assertValidKeyVal("x-ref-token", ["Bearer"]);
// });
