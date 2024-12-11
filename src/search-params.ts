import type { Stringable } from "./types.ts";

/** Intermediate class to allow type coercion when generating
 * URL Search Params. */
export class SearchParams extends URLSearchParams {
  constructor(
    init?:
      | SearchParams
      | URLSearchParams
      | Iterable<[Stringable, Stringable]>
      | Record<string, Stringable>
      | string,
  ) {
    super(init as Iterable<string[]> | Record<string, string> | string);
  }
}
