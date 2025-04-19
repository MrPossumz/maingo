import { assertEquals, assertThrows } from "@std/assert";
import { appendParamsDelimited, appendParamsIndexed } from "@/utils/url-search-params.ts";

Deno.test("appendParamsDelimited appends valid key-value pairs to URL", () => {
  const url = new URL("https://example.com");
  const params = { key1: "value1", key2: "value2" };

  appendParamsDelimited(url, params);

  const searchParams = url.searchParams;
  assertEquals(searchParams.get("key1"), "value1");
  assertEquals(searchParams.get("key2"), "value2");
});

Deno.test("appendParamsDelimited skips invalid key-value pairs", () => {
  const url = new URL("https://example.com");
  const params = { key1: "value1", key2: undefined, key3: null };

	// @ts-expect-error We're purposefully passing bad data
  appendParamsDelimited(url, params);

  const searchParams = url.searchParams;
  assertEquals(searchParams.get("key1"), "value1");
  assertEquals(searchParams.get("key2"), null);
  assertEquals(searchParams.get("key3"), null);
});

Deno.test("appendParamsIndexed appends indexed array values to URL", () => {
  const url = new URL("https://example.com");
  const params = { key1: ["value1", "value2"], key2: "value3" };

  appendParamsIndexed(url, params);

  const searchParams = url.searchParams;
  assertEquals(searchParams.get("key1[0]"), "value1");
  assertEquals(searchParams.get("key1[1]"), "value2");
  assertEquals(searchParams.get("key2"), "value3");
});

Deno.test("appendParamsIndexed throws error for invalid array items", () => {
  const url = new URL("https://example.com");
  const params = { key1: ["value1", null] };

  assertThrows(
    () => appendParamsIndexed(url, params),
    Error,
    'Invalid array item type. Found: "null"',
  );
});

Deno.test("appendParamsIndexed appends boolean values as 1 or 0", () => {
  const url = new URL("https://example.com");
  const params = { key1: true, key2: false };

  appendParamsIndexed(url, params);

  const searchParams = url.searchParams;
  assertEquals(searchParams.get("key1"), "1");
  assertEquals(searchParams.get("key2"), "0");
});

Deno.test("appendParamsIndexed skips invalid key-value pairs", () => {
  const url = new URL("https://example.com");
  const params = { key1: "value1", key2: undefined, key3: null };

	// @ts-expect-error We're purposefully passing bad data
  appendParamsIndexed(url, params);

  const searchParams = url.searchParams;
  assertEquals(searchParams.get("key1"), "value1");
  assertEquals(searchParams.get("key2"), null);
  assertEquals(searchParams.get("key3"), null);
});
