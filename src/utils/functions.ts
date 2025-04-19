/**
 * Determines if a given function is an asynchronous function.
 *
 * @param fn - The function to check. It can be either a generic `Function` or a specific
 *             function type that returns a `Promise`.
 * @returns A type guard indicating whether the provided function is an asynchronous function
 *          (i.e., a function that returns a `Promise`).
 */
export const isAsyncFunction = (
  // deno-lint-ignore ban-types
  fn: Function | ((...args: unknown[]) => Promise<unknown>),
): fn is (...args: unknown[]) => Promise<unknown> => {
  return fn instanceof async function () {}.constructor;
};
