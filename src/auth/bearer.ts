import { createTypeGuard, Is } from "guardis";
import { AuthBase, type AuthConfigBase } from "./base.ts";
import type { Middleware } from "@/middleware-stack.ts";

/**
 * Configuration interface for Bearer token-based authentication.
 * Extends the base authentication configuration.
 *
 * @extends AuthConfigBase
 *
 * @property {string} token - The Bearer token used for authentication.
 */
export interface BearerAuthConfig extends AuthConfigBase {
  token: string;
}

export const isBearerAuthConfig = createTypeGuard<BearerAuthConfig>((v, has) => {
  if (
    v && typeof v === "object" &&
    has(v, "token", Is.String)
  ) {
    return v;
  }

  return null;
});

/**
 * A class that implements Bearer token-based authentication.
 * This class extends the `AuthBase` class and provides a mechanism
 * to add a Bearer token to the `Authorization` header of outgoing requests.
 *
 * @example
 * ```typescript
 * const auth = new BearerAuth({ token: "your-bearer-token" });
 * const middleware = auth.getAuthentication();
 * ```
 */
export default class BearerAuth extends AuthBase<BearerAuthConfig> {
  constructor(config: BearerAuthConfig) {
    super(config);
		
    if (!isBearerAuthConfig(config)) {
      throw new Error("Invalid BearerAuthConfig provided");
    }
  }

  /**
   * Overrides the `getAuthentication` method to provide a middleware
   * that adds a Bearer token to the `Authorization` header of the request.
   *
   * @returns A middleware function that modifies the request headers
   *          to include the Bearer token and then forwards the request.
   */
  override getAuthentication(): Middleware {
    return async (req, next) => {
      req.headers ??= {};
      req.headers["authorization"] = `Bearer ${this.config.token}`;

      return next(req);
    };
  }
}
