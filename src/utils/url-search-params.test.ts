import { assert, assertEquals } from "@std/assert";
import { concatSearchParams } from "./url-search-params.ts";

Deno.test("concatSearchParams", () => {
  const newParams = concatSearchParams({ one: "1" }, { two: "2" });

	assert(newParams instanceof URLSearchParams);
	assertEquals(newParams.size, 2);
	assert(newParams.has('one'));
	assertEquals(newParams.get('one'), '1');
	assert(newParams.has('two'));
	assertEquals(newParams.get('two'), '2');
});
