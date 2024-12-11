import type { Catalog } from "../types.ts";
import type { Config } from "../config.ts";
import { isRestConnectorConfig, REST, type RestConnectorConfig } from "./rest.ts";
import { Graphql, type GraphqlConnectorConfig, isGraphqlConnectorConfig } from "./graphql.ts";

export type ConnectorResolver<C extends Catalog, Cfg extends Config> = Cfg extends
  RestConnectorConfig ? REST<C>
  : Cfg extends GraphqlConnectorConfig ? Graphql<C>
  : never;

export function createConnector<C extends Config>(config: C) {
  if (isRestConnectorConfig(config)) return new REST(config);
  if (isGraphqlConnectorConfig(config)) return new Graphql(config);
}
