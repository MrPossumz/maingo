import type { Middleware } from "@/middleware-stack.ts";
import type { RequestHeaders } from "@/types.ts";
import type { DiscriminatedUnion } from "@/utils/types.ts";
import { RestConnector, type RestConnectorConfig } from "./rest.ts";
import { GraphqlConnector, type GraphqlConnectorConfig } from "./graphql.ts";

export function getConnector<C extends ConnectorConfig>(
  config: C,
  getMiddleware: () => Middleware[],
) {
  switch (config.connector) {
    case "rest":
      return new RestConnector(config, getMiddleware);
    case "graphql":
      return new GraphqlConnector(config, getMiddleware);
  }
}

export interface ConnectorConfigBase {
  hostname: string;
  headers?: RequestHeaders;
}

export type ConnectorConfig = DiscriminatedUnion<{
  rest: RestConnectorConfig;
  graphql: GraphqlConnectorConfig;
}, "connector">;
