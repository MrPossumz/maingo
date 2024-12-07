import type { SearchParamsInit, Stringable } from "@/types.ts";
import { Is } from "@/guards.ts";
import { SearchParams } from "@/search-params.ts";

/** Convert any URL Search Param strings to URLSearchParams instance. */
function stringToParams(params: Exclude<SearchParamsInit, undefined>) {
  return typeof params === "string" ? new URLSearchParams(params) : params;
}

/** Convert [string, string][], Record<string, string>, URLSearchParams to
 * [string, string][] for use in creating a new URLSearchParams instance. */
function paramsToEntries(
  params: Exclude<SearchParamsInit, string | undefined>,
): [Stringable, Stringable][] {
  return Array.isArray(params)
    ? params
    : params instanceof URLSearchParams
    ? Array.from(params.entries())
    : Object.entries(params);
}

/** Ensure that the URL Search Params Init is converted to
 * URLSearchParams object. */
function toUrlSearchParams(
  params: Exclude<SearchParamsInit, undefined>,
): URLSearchParams {
  return Is.URLSearchParams(params) ? params : new SearchParams(params);
}

/**
 * Combines two URL Search Param instances into a new
 * instance.
 * @param paramsOne
 * @param paramsTwo
 * @returns
 */
export function concatSearchParams(
  paramsOne: SearchParamsInit,
  paramsTwo: SearchParamsInit,
): URLSearchParams {
  if (!paramsOne) {
    return paramsTwo ? toUrlSearchParams(paramsTwo) : new URLSearchParams();
  } else if (!paramsTwo) {
    return toUrlSearchParams(paramsOne);
  }

  return new SearchParams([
    ...paramsToEntries(stringToParams(paramsOne!)),
    ...paramsToEntries(stringToParams(paramsTwo!)),
  ]);
}
