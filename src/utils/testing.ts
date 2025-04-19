import { stub } from "@std/testing/mock";

export type MockFetchAssertion = (input: Request) => Promise<Response>;

/**
 * Mocks the global `fetch` function with a stubbed implementation.
 *
 * @param {Response | MockFetchAssertion} mockResponse - The mock response to be returned by the stubbed `fetch`.
 * It can either be an instance of `Response` or a custom function (`MockFetchAssertion`)
 * that defines the behavior of the mocked `fetch`.
 *
 * @returns The stubbed `fetch` function, replacing the global `fetch`.
 * Note: After finishing with the stub, you must call `.restore` on the returned object
 * to restore the original `fetch` implementation.
 *
 * @example
 * ```typescript
 * const mockResponse = new Response(JSON.stringify({ data: "test" }), { status: 200 });
 * const stub = mockFetch(mockResponse);
 *
 * const response = await fetch("/api/test");
 * const data = await response.json();
 * console.log(data); // { data: "test" }
 *
 * // Restore the original fetch
 * stub.restore();
 * ```
 */
export function mockFetch(mockResponse: Response | MockFetchAssertion) {
  return globalThis.fetch = stub(
    globalThis,
    "fetch",
    (mockResponse instanceof Response ? () => Promise.resolve(mockResponse) : mockResponse) as any,
  );
}
