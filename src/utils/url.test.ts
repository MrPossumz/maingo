import { assertEquals } from "@std/assert";
import { formatSearchParamPHP, normalizeHostname } from "./url.ts";

Deno.test("normalizeHostname", () => {
  assertEquals(
    normalizeHostname("http://api.example.com"),
    "http://api.example.com/",
  );
  assertEquals(
    normalizeHostname("http://api.example.com/"),
    "http://api.example.com/",
  );
});

Deno.test("formatSearchParamPHP", async (t) => {
  const url = new URL("http://api.example.com");
  const decode = () => decodeURIComponent(url.toString());

  await t.step("format arrays", () => {
    formatSearchParamPHP("key", ["value1", "value2"], url);
    assertEquals(
      decode(),
      "http://api.example.com/?key[0]=value1&key[1]=value2",
    );

    url.searchParams.delete("key[0]");
    url.searchParams.delete("key[1]");
  });

  await t.step("format strings", () => {
    formatSearchParamPHP("key", "value", url);
    assertEquals(decode(), "http://api.example.com/?key=value");

    url.searchParams.delete("key");
  });

  await t.step("format booleans", () => {
    formatSearchParamPHP("key", true, url);
    assertEquals(decode(), "http://api.example.com/?key=1");

    url.searchParams.delete("key");

    formatSearchParamPHP("key", false, url);
    assertEquals(decode(), "http://api.example.com/?key=0");

    url.searchParams.delete("key");
  });
});
