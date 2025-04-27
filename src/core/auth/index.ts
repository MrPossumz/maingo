import type { Client } from "@/core/client.ts";
import type { Middleware } from "@/core/middleware-stack.ts";
import type { DiscriminatedUnion } from "@/utils/types.ts";
import BasicAuth, { type BasicAuthConfig } from "./basic.ts";
import BearerAuth, { type BearerAuthConfig } from "./bearer.ts";
import OAuth2, { type OAuth2Config } from "./oauth2.ts";

/**
 * Interface representing authentication methods for a client.
 */
export interface AuthMethods {
	/**
	 * Retrieves the authentication middleware for the specified client.
	 *
	 * @param client - The client instance for which authentication middleware is required.
	 * @returns The middleware responsible for handling authentication.
	 */
	getAuthentication: (client: Client) => Middleware;
}

/**
 * Represents the configuration for different authentication methods.
 *
 * This type defines a discriminated union based on the authentication strategy.
 * Use this type to specify how the client should authenticate requests.
 *
 * The specific structure depends on the chosen authentication method, typically
 * identified by a `type` property:
 *
 * - `{ type: 'none' }`: No authentication is used.
 * - `{ type: 'basic', ...BasicAuthConfig }`: Uses HTTP Basic Authentication.
 * - `{ type: 'bearer', ...BearerAuthConfig }`: Uses Bearer Token Authentication.
 * - `{ type: 'oauth2', ...OAuth2Config }`: Uses OAuth2 Authentication flow.
 *
 * {@linkcode BasicAuthConfig}
 * {@linkcode BearerAuthConfig}
 * {@linkcode OAuth2Config}
 */
export type AuthConfig = DiscriminatedUnion<{
  none: {};
  basic: BasicAuthConfig;
  bearer: BearerAuthConfig;
  oauth2: OAuth2Config;
}>;

/**
 * Factory function to create an authentication instance based on the provided configuration.
 *
 * @template C - The specific type of the authentication configuration, extending AuthConfig.
 * @param {C} [config] - The authentication configuration object. Determines the type of authentication to instantiate.
 *                       If undefined or if `config.type` is "none", no authentication instance is created.
 * @returns {BasicAuth | BearerAuth | OAuth2 | undefined} An instance of the appropriate authentication class
 *                                                        (BasicAuth, BearerAuth, OAuth2) based on the `config.type`,
 *                                                        or `undefined` if no authentication type is specified or needed.
 */
export function getAuth<C extends AuthConfig>(config?: C) {
  switch (config?.type) {
    case undefined:
    case "none":
      return;
    case "basic":
      return new BasicAuth(config);
    case "bearer":
      return new BearerAuth(config);
    case "oauth2":
      return new OAuth2(config);
  }
}
