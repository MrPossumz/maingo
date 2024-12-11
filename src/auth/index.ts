import type { Catalog } from "../types.ts";
import type { Config } from "../config.ts";
import NoAuth, { isNoAuthConfig, type NoAuthConfig } from "./no-auth.ts";
import BasicAuth, { type BasicAuthConfig, isBasicAuthConfig } from "./basic.ts";
import BearerAuth, { type BearerAuthConfig, isBearerAuthConfig } from "./bearer.ts";
import OAuth2, { isOAuth2Config, type OAuth2Config } from "./oauth2.ts";

export type AuthResolver<L extends Catalog, C extends Config> = C extends NoAuthConfig ? NoAuth<L>
  : C extends BasicAuthConfig ? BasicAuth<L>
  : C extends BearerAuthConfig ? BearerAuth<L>
  : C extends OAuth2Config ? OAuth2<L>
  : never;

export function createAuthAdapter<C extends Config>(config: C) {
  if (isNoAuthConfig(config)) return new NoAuth(config);
  if (isBasicAuthConfig(config)) return new BasicAuth(config);
  if (isBearerAuthConfig(config)) return new BearerAuth(config);
  if (isOAuth2Config(config)) return new OAuth2(config);
}
