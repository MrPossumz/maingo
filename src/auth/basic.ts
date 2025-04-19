import { createTypeGuard, Is } from "guardis";
import { AuthBase, type AuthConfigBase } from "./base.ts";
import type { Middleware } from "@/middleware-stack.ts";

/**
 * Configuration interface for Basic Authentication.
 * Extends the base authentication configuration interface.
 *
 * @extends AuthConfigBase
 *
 * @property {string|number} id - The identifier for the basic authentication, which can be a string or a number.
 * @property {string|number} secret - The secret or password for the basic authentication, which can be a string or a number.
 */
export interface BasicAuthConfig extends AuthConfigBase {
  // type: "basic" | "Basic";
  id: string | number;
  secret: string | number;
}

export const isBasicAuthConfig = createTypeGuard<BasicAuthConfig>((v, has) => {
  if (
    v &&
    typeof v === "object" &&
    has(v, "id", (v: unknown): v is string | number => Is.String(v) || Is.Number(v)) &&
    has(v, "secret", (v: unknown): v is string | number => Is.String(v) || Is.Number(v))
  ) {
    return v;
  }

  return null;
});

/**
 * Represents a Basic Authentication mechanism for API requests.
 *
 * This class extends `AuthBase` and provides functionality to encode
 * credentials in Base64 format and attach them as an `Authorization`
 * header to outgoing requests.
 */
export default class BasicAuth extends AuthBase<BasicAuthConfig> {
  private encodedCredentials: string;

  constructor(config: BasicAuthConfig) {
    super(config);

    if (!isBasicAuthConfig(config)) {
      throw new Error("Invalid BasicAuthConfig provided");
    }

    this.encodedCredentials = btoa(`${config.id}:${config.secret}`);
  }

  /**
   * Overrides the `getAuthentication` method to provide Basic Authentication middleware.
   *
   * @returns A middleware function that adds an `Authorization` header with Basic Authentication
   *          credentials to the request before passing it to the next middleware.
   */
  override getAuthentication(): Middleware {
    return async (req, next) => {
      req.headers ??= {};
      req.headers["authorization"] = `Basic ${this.encodedCredentials}`;

      return next(req);
    };
  }
}
