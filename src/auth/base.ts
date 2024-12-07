import type { Catalog } from "@/types.ts";
import type { Client } from "@/client.ts";
import type { RequestMap, ResponseMap } from "@/middleware/types.ts";
import type { AuthConfig } from "@/auth/types.ts";

export abstract class AuthBase<L extends Catalog> {
  constructor(protected config: AuthConfig) {}

  /**
   * A callback used to patch in whatever authentication logic
   * is necessary for this auth type.
   * @returns
   */
  abstract getAuthentication(client: Client<L>): RequestMap;

  /**
   * A callback that will be inserted into the middleware
   * stack and used to check authentication after every API call.
   * @returns
   */
  checkAuthentication(_client: Client<L>): ResponseMap {
    return (next) => next();
  }
}
