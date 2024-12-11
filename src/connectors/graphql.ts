import type { Call, Catalog, EndpointString, GraphqlMethods, RequestComponents } from "../types.ts";
import { type Config, isConfig } from "../config.ts";
import { ConnectorBase } from "./base.ts";
import { createTypeGuard } from "../../deps.ts";
import type { RequestResolver, ResponseResolver } from "./types.ts";
import type { Client } from "../client.ts";

/** A library specific for GraphQL APIs. */
export interface GraphqlCatalog extends Catalog {
  [x: EndpointString]: { [key in GraphqlMethods]?: Call };
}

export interface GraphqlConnectorConfig extends Config {
  connector: typeof Graphql["type"];
}

export const isGraphqlConnectorConfig = createTypeGuard((v, has) => {
  return isConfig(v) && has(v, "connector", (v: unknown) => v === "Graphql") ? v : null;
});

export interface GraphqlMethodsInterface<C extends GraphqlCatalog> {
  query<K extends keyof C & EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "query">
  ): Promise<ResponseResolver<C, K, "query">>;
  query<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "query">
  ): Promise<ResponseResolver<C, K, "query">>;
}

export class Graphql<C extends GraphqlCatalog> extends ConnectorBase<C>
  implements GraphqlMethodsInterface<C> {
  public static readonly type = "Graphql";

  constructor(config: GraphqlConnectorConfig) {
    super(config);
  }

  public override initializeClient<T extends Client<C, Cfg>, Cfg extends Config>(
    client: T,
  ): T & GraphqlMethodsInterface<C> {
    const _client = client as T & GraphqlMethodsInterface<C>;
    _client.query = this.query.bind(this);
    return _client;
  }

  /**
   * Perform a Query request.
   * @param {string} endpoint
   * @param {BodyInit} body
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public query<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "query">
  ) {
    return this.request(
      "post",
      endpoint,
      body as RequestComponents["body"],
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "query">>;
  }
}
