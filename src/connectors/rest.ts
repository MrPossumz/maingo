import type { Client } from "@/client.ts";
import type { MaingoRequest, MaingoResponse } from "../types.ts";
import { ConnectorBase, type MaingoConnector } from "./base.ts";
import type { ConnectorConfigBase } from "@/connectors/index.ts";

export interface RestConnectorConfig extends ConnectorConfigBase {}

export interface MaingoRestRequest extends Omit<MaingoRequest, "method"> {
  endpoint: string;
}

export interface MaingoRestConnector extends MaingoConnector<MaingoRestRequest> {
  post(req: MaingoRestRequest): Promise<MaingoResponse>;
  put(req: MaingoRestRequest): Promise<MaingoResponse>;
  patch(req: MaingoRestRequest): Promise<MaingoResponse>;
  delete(req: MaingoRestRequest): Promise<MaingoResponse>;
  options(req: MaingoRestRequest): Promise<MaingoResponse>;
  head(req: MaingoRestRequest): Promise<MaingoResponse>;
  get(req: MaingoRestRequest): Promise<MaingoResponse>;
  init(client: Client): Client & MaingoRestConnector;
}

export class RestConnector extends ConnectorBase<RestConnectorConfig>
  implements MaingoRestConnector {
  declare public REQUEST_TYPE: MaingoRestRequest;

  public async post(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "post" });
  }

  public async put(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "put" });
  }

  public async patch(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "patch" });
  }

  public async delete(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "delete" });
  }

  public async options(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "options" });
  }

  public async head(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "head" });
  }

  public async get(req: MaingoRestRequest): Promise<MaingoResponse> {
    return this.request({ ...req, method: "get" });
  }

  public override init(client: Client) {
    return Object.assign(client, {
      post: this.post.bind(this),
      put: this.put.bind(this),
      patch: this.patch.bind(this),
      delete: this.delete.bind(this),
      options: this.options.bind(this),
      head: this.head.bind(this),
      get: this.get.bind(this),
    }) as Client & MaingoRestConnector;
  }
}
