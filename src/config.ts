import { createTypeGuard, Is } from "../deps.ts";
import type { ConnectorType } from "./connectors/types.ts";
import type { Catalog } from "./types.ts";
import type { RestCatalog, RestConnectorConfig } from "./connectors/rest.ts";
import type { GraphqlCatalog, GraphqlConnectorConfig } from "./connectors/graphql.ts";
import { type AuthType, isAuthType } from "./auth/types.ts";
import type { BasicAuthConfig } from "./auth/basic.ts";
import type { BearerAuthConfig } from "./auth/bearer.ts";
import type { OAuth2Config } from "./auth/oauth2.ts";
import type { NoAuthConfig } from "./auth/no-auth.ts";

export interface Config {
  /** The type of connector to use for all API calls. Currently
   * Rest and Graphql are supported. */
  connector: ConnectorType;
  /** The common hostname of the URI hosting the API endpoints. This
   * will be used as the base for all API endpoint calls. */
  hostname: string;
  /** The default headers to send with each request. These headers
   * will persist between each request. */
  headers?: Record<string, string>;
  /** The format to use when serializing search parameters. This
   * is only used on URL search parameters and largely concerns
   * formatting array parameters.
   *
   * PHP expects array parameters to be formatted similar to
   * formData using myArray[]=value1&myArray[]=value2. This is
   * contrary to the default browser behavior which uses comma
   * delimited.
   *
   * Default: 'delimited' */
  searchParamFormat?: "delimited" | "php";
  /** The authentication type to use for all API calls. */
  auth?: AuthType;
}

export const isConfig = createTypeGuard<Config>((v, has) => {
  if (
    v &&
    typeof v === "object" &&
    has(v, "connector", (v: unknown) => v === "REST" || v === "Graphql") &&
    has(v, "hostname", Is.String) &&
    has(v, "auth", isAuthType)
  ) {
    return v;
  }

  return null;
});

export type ConfigResolver<
  L extends Catalog,
  ConnectorConfig extends Config = ConnectorConfigResolver<L>,
> =
  & ConnectorConfig
  & AuthConfigResolver<ConnectorConfig>;

export type ConnectorConfigResolver<L extends Catalog> = L extends RestCatalog ? RestConnectorConfig
  : L extends GraphqlCatalog ? GraphqlConnectorConfig
  : Config;

export type AuthConfigResolver<C extends { auth?: AuthType }, AuthType = C["auth"]> =
  AuthType extends BasicAuthConfig["auth"] ? BasicAuthConfig
    : AuthType extends BearerAuthConfig["auth"] ? BearerAuthConfig
    : AuthType extends OAuth2Config["auth"] ? OAuth2Config
    : AuthType extends NoAuthConfig["auth"] ? NoAuthConfig
    : never;
