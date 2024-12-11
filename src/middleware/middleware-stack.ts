import type {
  RemoveMap,
  RemoveTap,
  RequestMap,
  RequestMapCallback,
  RequestTap,
  ResponseMap,
  ResponseMapCallback,
  ResponseTap,
} from "./types.ts";
import type { StdRequestComponents } from "../types.ts";

export default class MiddlewareStack {
  #requestTaps: Set<RequestTap> = new Set();
  #responseTaps: Set<ResponseTap> = new Set();

  #requestMaps: Set<RequestMap> = new Set();
  #responseMaps: Set<ResponseMap> = new Set();

  /**
   * Tap into the middleware stack using callbacks. The callback will
   * receive a cloned copy of the response and/or request. Changes made
   * to the request will not carry over to the API call or persist in
   * the final returned response.
   *
   * Taps are invoked in the order they are added.
   *
   * Requests and Responses are passed to taps after the middleware has
   * been applied.
   * @param {function} tap
   * @returns {function}
   */
  public tap(type: "request", fn: RequestTap): RemoveTap;
  public tap(type: "response", fn: ResponseTap): RemoveTap;
  public tap(type: "request" | "response", fn: RequestTap | ResponseTap): RemoveTap {
    const targetSet = type === "request" ? this.#requestTaps : this.#responseTaps;

    targetSet.add(fn as RequestTap & ResponseTap);

    return () => targetSet.delete(fn as RequestTap & ResponseTap);
  }

  /**
   * Invoke the request taps. Taps are invoked sequentially.
   * @param {Request} request
   */
  public async applyRequestTap(request: Request, next: () => Promise<void> | void): Promise<void> {
    let wasInvoked = true;
    let lastInvokedStep = this.#requestTaps.size;

    await this.#requestTaps
      .values()
      .toArray()
      .reduce((p: () => Promise<void> | void, c) => () => {
        wasInvoked = false;
        // deno-fmt-ignore
        c(() => {  wasInvoked = true; lastInvokedStep--; p(); }, request.clone());
      }, next)();

    if (!wasInvoked) {
      throw Error(
        `Request tap ${lastInvokedStep} failed to call next() before returning.`,
      );
    }
  }

  /**
   * Invoke post-response taps
   * @param {Response} response
   */
  public applyResponseTap(response: Response, request: Request) {
    for (const tap of this.#responseTaps) {
      tap(response.clone(), request.clone());
    }
  }

  /**
   * Push a mapping callback into the stack. Callbacks may map
   * either the request or response objects of the api call.
   *
   * Maps are invoked in the order they are added, from the outermost
   * going inward.
   * @param {string} type
   * @param {function} fn
   * @returns {function}
   */
  public push<Fn extends RequestMap>(type: "request", fn: Fn): RemoveMap;
  public push<Fn extends ResponseMap>(type: "response", fn: Fn): RemoveMap;
  public push(
    type: "request" | "response",
    fn: RequestMap | RemoveMap,
  ): RemoveMap {
    const targetSet = type === "request" ? this.#requestMaps : this.#responseMaps;

    targetSet.add(fn as RequestMap & ResponseMap);

    return () => targetSet.delete(fn as RequestMap & ResponseMap);
  }

  /**
   * Apply request map middleware to request constituents
   * @param {object} request
   * @returns {object}
   */
  public async applyRequestMap(request: StdRequestComponents) {
    // Roll up all of the request maps into a single callback
    const rollup = this.#requestMaps
      .values()
      .toArray()
      .reduce((p, map) => () => map(p as RequestMapCallback), () => request);

    return await (rollup as RequestMapCallback)();
  }

  /**
   * Apply response map middleware to response cosntituents
   * @param {object} response
   * @returns {object}
   */
  public async applyResponseMap(request: Request, response: Response) {
    const rollup = this.#responseMaps
      .values()
      .toArray()
      .reduce((p, map) => () => map(p as ResponseMapCallback, request), () => response);

    return await (rollup as ResponseMapCallback)();
  }
}
