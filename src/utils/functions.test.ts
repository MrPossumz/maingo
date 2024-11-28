import { assert, assertFalse } from "@std/assert";
import { isAsyncFunction } from "./functions.ts";

Deno.test("isAsyncFunction", () => {
  assert(isAsyncFunction(async () => await Promise.resolve()));
  assertFalse(isAsyncFunction(() => {}));
});
