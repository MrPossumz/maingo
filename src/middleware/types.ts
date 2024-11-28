import type { StdRequestComponents } from "@/types.ts";

export type RequestMapCallback = () => StdRequestComponents | Promise<StdRequestComponents>;
export type ResponseMapCallback = () => Response | Promise<Response>;

/** A method used to map components of a request and update them
 * prior to the request being executed. */
export type RequestMap = (
  next: RequestMapCallback,
) => StdRequestComponents | Promise<StdRequestComponents>;

/** A method used to map responses from a request, post update. */
export type ResponseMap = (next: ResponseMapCallback, req: Request) => Response | Promise<Response>;

/** A callback method that removes a map that has been inserted into
 * the middleware stack. */
export type RemoveMap = () => void;

/** A method used to tap into the request before and immediately after the
 * request is fired. Taps must call the next method. */
export type RequestTap = (
  request: Request,
  next: () => Promise<void> | void,
) => Promise<void> | void;

/** A method that will be executed immediately after the response is received. */
export type ResponseTap = (response: Response, request?: Request) => void;

/** A callback method that removes a tap that has been inserted into
 * the middleware stack. */
export type RemoveTap = () => void;
