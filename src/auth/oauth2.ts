import { createTypeGuard, Is } from "guardis";
import type { Catalog } from "@/types.ts";
import { type Config, isConfig } from "@/config.ts";
import type { Client } from "@/client.ts";
import type { RequestMap, ResponseMap } from "@/middleware/types.ts";
import { AuthBase } from "./base.ts";

export type OAuth2TokenRecord = {
  refreshToken?: string;
  accessToken: string;
  expirationTimestamp?: number;
};

export interface OAuth2Config extends Config {
  auth: typeof OAuth2["type"];
  scope?: string;
  clientId: string;
  clientSecret: string;
  grantType: string;
  accessTokenCallback: <L extends Catalog>(client: Client<L>) => Promise<OAuth2TokenRecord>;
  refreshTokenCallback: <L extends Catalog>(client: Client<L>) => Promise<OAuth2TokenRecord>;
}

export const isOAuth2Config = createTypeGuard<OAuth2Config>((v, has) => {
  const isAccessTokenCallback = (fn: unknown): fn is OAuth2Config["accessTokenCallback"] =>
    Is.Function(fn);
  const isRefreshTokenCallback = (fn: unknown): fn is OAuth2Config["refreshTokenCallback"] =>
    Is.Function(fn);

  if (
    isConfig(v) &&
    has(v, "auth", (v) => v === "oauth2") &&
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

export default class OAuth2<L extends Catalog> extends AuthBase<L> {
  declare protected config: OAuth2Config;

  public static readonly type = "oauth2";

  protected tokenType: string = "Bearer";
  protected accessToken: string | undefined;
  protected refreshToken: string | undefined;
  protected expirationTimestamp: number = 0;

  protected authorizing = false;

	constructor(config: OAuth2Config) {
		super(config);
	}

  override getAuthentication(client: Client<L>): RequestMap {
    return async (next) => {
      const components = await next();

      // Attempting to retrieve access or refresh token already. Skip calling.
      if (this.authorizing) components;

      if (!this.accessToken) {
        this.authorizing = true;
        // get a token
        await this.config
          .accessTokenCallback(client)
          .then((resp) => {
            this.accessToken = resp.accessToken;
            this.refreshToken = resp?.refreshToken;
            this.expirationTimestamp = resp?.expirationTimestamp || 0;
          })
          .finally(() => (this.authorizing = false));
      }

      components.headers["Authorization"] = `Bearer ${this.accessToken}`;

      return components;
    };
  }

  override checkAuthentication(client: Client<L>): ResponseMap {
    let attempted = false;
    return async (next) => {
      const response = await next();

      const shouldRefresh = (response.status === 401 || response.status === 403) && !attempted;

      if (shouldRefresh) {
        attempted = true;
        return this.refreshAccessToken(client)
          .then(client.connector.refire);
      }

      attempted = false;

      return response;
    };
  }

  /**
   * Attempt to retrieve an access token using the config callback.
   * @param {object} client
   * @returns {Promise}
   */
  public refreshAccessToken(client: Client<L>) {
    this.authorizing = true;

    return this.config
      .refreshTokenCallback(client)
      .then(({ accessToken, refreshToken, expirationTimestamp, ...rest }) => {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expirationTimestamp = expirationTimestamp || 0;

        return { accessToken, refreshToken, expirationTimestamp, ...rest };
      })
      .finally(() => (this.authorizing = false));
  }
}
