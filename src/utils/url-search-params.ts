import type { MaingoRequest } from "@/types.ts";
import { Is } from "@/guards.ts";

/**
 * Appends key-value pairs from the provided `params` object to the search parameters
 * of the given `url`. Each key-value pair is validated before being appended.
 *
 * @param url - The `URL` object to which the parameters will be appended.
 * @param params - An object containing key-value pairs to append to the URL's search parameters.
 *                 This is derived from the `params` property of a `MaingoRequest`, excluding `undefined`.
 */
export function appendParamsDelimited(
  url: URL,
  params: Exclude<MaingoRequest["params"], undefined>,
) {
  for (const [key, value] of Object.entries(params)) {
    if (!Is.Stringable(key) || !Is.Stringable(value)) {
      continue;
    }

    url.searchParams.append(key, value.toString());
  }
}

/**
 * Appends query parameters to a given URL object. Handles various data types
 * including arrays, booleans, and other primitive types. Array values are
 * indexed in the query string, and boolean values are converted to "1" (true)
 * or "0" (false).
 *
 * @param url - The URL object to which the query parameters will be appended.
 * @param params - An object containing key-value pairs to be appended as query parameters.
 *                 The keys must be valid URL parameter keys, and the values must be valid
 *                 URL parameter values.
 *
 * @throws {Error} If an array contains an invalid item type (null or undefined).
 */
export function appendParamsIndexed(
  url: URL,
  params: Exclude<MaingoRequest["params"], undefined>,
) {
  for (const [key, value] of Object.entries(params)) {
    if (!Is.Stringable(key) || !Is.Stringable(value)) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item !== null && item !== undefined) {
          url.searchParams.append(`${key}[${i}]`, item.toString());
        } else {
          throw new Error(`Invalid array item type. Found: "${item}"`);
        }
      });
    } else if (typeof value === "boolean") {
      url.searchParams.append(key, value ? "1" : "0");
    } else {
      url.searchParams.append(key, value.toString());
    }
  }
}
