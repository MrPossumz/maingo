import type { Middleware } from "@/middleware-stack.ts";
import type { Client } from "@/client.ts";
import { createTypeGuard, Is } from "@/guards.ts";
import { AuthBase, type AuthConfigBase } from "./base.ts";

/**
 * Represents a record containing OAuth2 token information.
 *
 * @property refreshToken - An optional refresh token used to obtain new access tokens.
 * @property accessToken - The access token used for authentication and authorization.
 * @property expirationTimestamp - An optional timestamp (in milliseconds since epoch) indicating when the access token expires.
 */
export type OAuth2TokenRecord = {
  refreshToken?: string;
  accessToken: string;
  expirationTimestamp?: number;
};

/**
 * Configuration interface for OAuth2 authentication.
 * Extends the base authentication configuration and includes
 * additional properties specific to OAuth2.
 *
 * @extends AuthConfigBase
 *
 * @property {string} [scope] - Optional scope of the OAuth2 access request.
 * @property {string | number} clientId - The client ID for the OAuth2 application.
 * @property {string | number} clientSecret - The client secret for the OAuth2 application.
 * @property {string} grantType - The grant type used for the OAuth2 flow.
 * @property {(client: Client) => Promise<OAuth2TokenRecord>} accessTokenCallback -
 *   A callback function that retrieves the access token for the client.
 * @property {(client: Client) => Promise<OAuth2TokenRecord>} refreshTokenCallback -
 *   A callback function that retrieves a refreshed access token for the client.
 */
export interface OAuth2Config extends AuthConfigBase {
	/** Optional scope of the OAuth2 access request. */
  scope?: string;
	/** The client ID for the OAuth2 application, which can be a string or a number. */
  clientId: string | number;
	/** The client secret for the OAuth2 application, which can be a string or a number. */
  clientSecret: string | number;
	/** The grant type used for the OAuth2 flow, e.g., 'client_credentials', 'authorization_code', etc. */
  grantType: string;
	/** A callback function that retrieves the access token for the client. */
  accessTokenCallback: (client: Client) => Promise<OAuth2TokenRecord>;
	/** A callback function that retrieves a refreshed access token for the client. */
  refreshTokenCallback: (client: Client) => Promise<OAuth2TokenRecord>;
}

export const isOAuth2Config = createTypeGuard<OAuth2Config>((v, has) => {
  const isAccessTokenCallback = (fn: unknown): fn is OAuth2Config["accessTokenCallback"] =>
    Is.Function(fn);
  const isRefreshTokenCallback = (fn: unknown): fn is OAuth2Config["refreshTokenCallback"] =>
    Is.Function(fn);

  if (
    v && typeof v === "object" &&
    has(v, "clientId", Is.String) &&
    has(v, "clientSecret", Is.String) &&
    has(v, "grantType", Is.String) &&
    has(v, "accessTokenCallback", isAccessTokenCallback) &&
    has(v, "refreshTokenCallback", isRefreshTokenCallback)
  ) {
    if ("scope" in v && !Is.String(v.scope)) {
      return null;
    }

    return v;
  }

  return null;
});

/**
 * Represents an OAuth2 authentication mechanism.
 *
 * This class extends the `AuthBase` class and provides functionality for handling
 * OAuth2-based authentication, including access token retrieval, token refresh,
 * and attaching the token to outgoing requests.
 *
 * @example
 * ```typescript
 * const oauth2Config = {
 *   auth: "oauth2",
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   grantType: "client_credentials",
 *   accessTokenCallback: async (client: Client) => { ... },
 *   refreshTokenCallback: async (client: Client) => { ... },
 * };
 *
 * const oauth2 = new OAuth2(oauth2Config);
 * const middleware = auth.getAuthentication();
 *
 * const middleware = oauth2.getAuthentication(client);
 * // Use the middleware in your HTTP client to attach the Authorization header
 * ```
 */
export default class OAuth2 extends AuthBase<OAuth2Config> {
  declare protected config: OAuth2Config;

  public static readonly type = "oauth2";

  protected tokenType: string = "Bearer";
  protected accessToken: string | undefined;
  protected refreshToken: string | undefined;
  protected expirationTimestamp: number = 0;

  protected authorizing = false;

  /**
   * A promise that resolves to the access token record.
   * This is used to prevent multiple concurrent requests for the same token.
   */
  protected activeTokenRequest?: Promise<OAuth2TokenRecord> | undefined;

  constructor(config: OAuth2Config) {
    super(config);

    if (!isOAuth2Config(config)) {
      throw new Error("Invalid OAuth2Config provided");
    }
  }

	/**
	 * Determines whether the current access token is expired.
	 *
	 * @returns {boolean} `true` if the access token is either missing, has an invalid expiration timestamp,
	 * or the current time has passed the expiration timestamp; otherwise, `false`.
	 */
  get tokenIsExpired(): boolean {
    return (
      !this.accessToken ||
      this.expirationTimestamp <= 0 ||
      Date.now() >= this.expirationTimestamp
    );
  }

	/**
	 * Overrides the `getAuthentication` method to provide OAuth2-based authentication middleware.
	 *
	 * @param client - The client instance used to retrieve the access token.
	 * @returns A middleware function that adds the `Authorization` header with a Bearer token
	 *          to the request if the access token is available and valid. If the token is expired
	 *          or unavailable, it retrieves a new access token before proceeding.
	 */
  override getAuthentication(client: Client): Middleware {
    return async (req, next) => {
      if (!this.authorizing) {
        if (!this.accessToken || this.tokenIsExpired) {
          await this.getAccessToken(client);
        }

        req.headers ??= {};
        req.headers["authorization"] = `Bearer ${this.accessToken}`;
      }

      return next(req);
    };
  }

  /**
   * Retrieves an access token for the provided client. If a token request is already in progress,
   * it returns the existing promise. Otherwise, it initiates a new token request using the
   * `accessTokenCallback` provided in the configuration.
   *
   * @param client - The client instance for which the access token is being requested.
   * @returns A promise that resolves to the access token response, which includes the access token,
   *          optional refresh token, and optional expiration timestamp.
   *
   * @remarks
   * - This method ensures that only one token request is active at a time by caching the promise
   *   during the request.
   * - Once the token request is completed, the `authorizing` flag is reset, and the cached promise
   *   is cleared.
   */
  private async getAccessToken(client: Client) {
    if (!this.activeTokenRequest) {
      this.authorizing = true;

			// Determine if we need to get an access token or refresh token
      const accessOrRefresh = this.refreshToken ? "refreshTokenCallback" : "accessTokenCallback";

      this.activeTokenRequest = this.config[accessOrRefresh](client)
        .then((resp) => {
          this.accessToken = resp.accessToken;
          this.refreshToken = resp?.refreshToken;
          this.expirationTimestamp = resp?.expirationTimestamp || 0;

          return resp;
        })
        .finally(() => {
          this.authorizing = false;
          this.activeTokenRequest = undefined;
        });
    }

    return this.activeTokenRequest;
  }
}
