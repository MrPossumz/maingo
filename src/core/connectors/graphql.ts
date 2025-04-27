import type { JsonValue, MaingoResponse, RequestBody, RequestHeaders } from "@/types.ts";
import type { Client } from "@/core/client.ts";
import { ConnectorBase, type MaingoConnector } from "./base.ts";
import type { ConnectorConfigBase } from "@/core/connectors/index.ts";

export type MaingoGraphqlRequest = {
  body?: RequestBody;
  params?: Record<string, JsonValue>;
  headers?: RequestHeaders;
};

export interface GraphqlConnectorConfig extends ConnectorConfigBase {
  /** The optional endpoint for the graphql API. All query requests will
   * be directed towards this endpoint. */
  endpoint?: string;
}

export interface MaingoGraphqlConnector extends MaingoConnector<MaingoGraphqlRequest> {
  query(req: MaingoGraphqlRequest): Promise<MaingoResponse>;
  init(client: Client): Client & MaingoGraphqlConnector;
}

export class GraphqlConnector extends ConnectorBase<GraphqlConnectorConfig>
  implements MaingoGraphqlConnector {
  declare public REQUEST_TYPE: MaingoGraphqlRequest;

  public async query(req: MaingoGraphqlRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "post", endpoint: this.config.endpoint });
  }

  public override init(client: Client) {
    return Object.assign(client, { query: this.query.bind(this) }) as
      & Client
      & MaingoGraphqlConnector;
  }
}
