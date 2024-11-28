export const isAsyncFunction = (
  // deno-lint-ignore ban-types
  fn: Function | ((...args: unknown[]) => Promise<unknown>),
): fn is (...args: unknown[]) => Promise<unknown> => {
  return fn instanceof async function () {}.constructor;
};
