import type { Stringable } from "@/types.ts";

/**
 * Ensure that the API hostname ends with a trailing slash
 * @param {string} hostname
 * @returns {string}
 */
export function normalizeHostname(hostname: string) {
  return hostname.charAt(hostname.length - 1) !== "/" ? hostname.concat("/") : hostname;
}

/**
 * Formats the search parameters for a PHP Server. Primarily
 * converts array parameters to the FormData format expected
 * in PHP.
 * @param {string} key
 * @param {string} value
 * @param {URL} url
 */
export function formatSearchParamPHP(
  key: string,
  value: string | Stringable,
  url: URL,
) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => url.searchParams.append(`${key}[${i}]`, item.toString()));
  } else if (typeof value === "boolean") {
    url.searchParams.append(key, value ? "1" : "0");
  } else {
    url.searchParams.append(key, value.toString());
  }
}

/**
 * Is the passed in string a valid URL?
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url: string) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i",
  ); // validate fragment locator
  return !!urlPattern.test(url);
}
