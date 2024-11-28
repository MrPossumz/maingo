import type { URLSearchParamsInit } from "@/types.ts";
import { Is } from "@/guards.ts";

/** Convert any URL Search Param strings to URLSearchParams instance. */
function stringToParams(params: Exclude<URLSearchParamsInit, undefined>) {
  return typeof params === "string" ? new URLSearchParams(params) : params;
}

/** Convert [string, string][], Record<string, string>, URLSearchParams to
 * [string, string][] for use in creating a new URLSearchParams instance. */
function paramsToEntries(
  params: Exclude<URLSearchParamsInit, string | undefined>,
): [string, string][] {
  return Array.isArray(params)
    ? params
    : params instanceof URLSearchParams
    ? Array.from(params.entries())
    : Object.entries(params);
}

/** Ensure that the URL Search Params Init is converted to
 * URLSearchParams object. */
function toUrlSearchParams(
  params: Exclude<URLSearchParamsInit, undefined>,
): URLSearchParams {
  return Is.URLSearchParams(params) ? params : new URLSearchParams(params);
}

/**
 * Combines two URL Search Param instances into a new
 * instance.
 * @param paramsOne
 * @param paramsTwo
 * @returns
 */
export function concatSearchParams(
  paramsOne: URLSearchParamsInit,
  paramsTwo: URLSearchParamsInit,
): URLSearchParams {
  if (!paramsOne) {
    return paramsTwo ? toUrlSearchParams(paramsTwo) : new URLSearchParams();
  } else if (!paramsTwo) {
    return toUrlSearchParams(paramsOne);
  }

  return new URLSearchParams([
    ...paramsToEntries(stringToParams(paramsOne!)),
    ...paramsToEntries(stringToParams(paramsTwo!)),
  ]);
}
