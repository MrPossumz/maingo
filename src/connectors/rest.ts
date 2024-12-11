import type { Call, Catalog, EndpointString, HTTPMethods, RequestComponents } from "../types.ts";
import { type Config, isConfig } from "../config.ts";
import { ConnectorBase } from "./base.ts";
import { createTypeGuard } from "../../deps.ts";
import type { RequestResolver, ResponseResolver } from "./types.ts";
import type { Client } from "../client.ts";

/** A library specific for Rest APIs. */
export interface RestCatalog extends Catalog {
  [x: EndpointString]: { [key in HTTPMethods]?: Call };
}

export interface RestConnectorConfig extends Config {
  connector: typeof REST["type"];
}

export const isRestConnectorConfig = createTypeGuard((v, has) => {
  return isConfig(v) && has(v, "connector", (v: unknown) => v === "REST") ? v : null;
});

export interface RestMethodsInterface<C extends RestCatalog> {
  head: REST<C>["head"];
  get: REST<C>["get"];
  post: REST<C>["post"];
  patch: REST<C>["patch"];
  put: REST<C>["put"];
  delete: REST<C>["delete"];
  options: REST<C>["options"];
}

export class REST<C extends RestCatalog> extends ConnectorBase<C> {
  public static readonly type = "REST";

  constructor(config: RestConnectorConfig) {
    super(config);
  }

  public override initializeClient<T extends Client<C, Cfg>, Cfg extends Config>(
    client: T,
  ): T & RestMethodsInterface<C> {
    const _client = client as T & RestMethodsInterface<C>;
    // Bind the connector methods to the client
    _client.head = this.head.bind(this);
    _client.get = this.get.bind(this);
    _client.post = this.post.bind(this);
    _client.patch = this.patch.bind(this);
    _client.put = this.put.bind(this);
    _client.delete = this.delete.bind(this);
    _client.options = this.options.bind(this);
    return _client;
  }

  /**
   * Perform a HEAD request
   * @param {string} endpoint
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public head<K extends keyof C & EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "head", true>
  ): Promise<ResponseResolver<C, K, "head">>;
  public head<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "head", true>
  ): Promise<ResponseResolver<C, K, "head">>;
  public head<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "head", true>
  ) {
    return this.request(
      "head",
      endpoint,
      undefined,
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "head">>;
  }

  /**
   * Perform a GET request
   * @param {string} endpoint
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public get<K extends keyof C & EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "get", true>
  ): Promise<ResponseResolver<C, K, "get">>;
  public get<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "get", true>
  ): Promise<ResponseResolver<C, K, "get">>;
  public get<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "get", true>
  ) {
    return this.request(
      "get",
      endpoint,
      undefined,
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "get">>;
  }

  /**
   * Perform a POST request
   * @param {string} endpoint
   * @param {BodyInit} body
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public post<K extends keyof C & EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "post">
  ): Promise<ResponseResolver<C, K, "post">>;
  public post<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "post">
  ): Promise<ResponseResolver<C, K, "post">>;
  public post<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "post">
  ) {
    return this.request(
      "post",
      endpoint,
      body as RequestComponents["body"],
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "post">>;
  }

  /**
   * Perform a PATCH request
   * @param {string} endpoint
   * @param {BodyInit} body
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public patch<K extends keyof C & EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "patch">
  ): Promise<ResponseResolver<C, K, "patch">>;
  public patch<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "patch">
  ): Promise<ResponseResolver<C, K, "patch">>;
  public patch<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "patch">
  ) {
    return this.request(
      "patch",
      endpoint,
      body as RequestComponents["body"],
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "patch">>;
  }

  /**
   * Perform a PUT request
   * @param {string} endpoint
   * @param {BodyInit} body
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public put<K extends keyof C & EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "put">
  ): Promise<ResponseResolver<C, K, "put">>;
  public put<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "put">
  ): Promise<ResponseResolver<C, K, "put">>;
  public put<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "put">
  ) {
    return this.request(
      "put",
      endpoint,
      body as RequestComponents["body"],
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "put">>;
  }

  /**
   * Perform a DELETE request
   * @param {string} endpoint
   * @param {BodyInit} body
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public delete<K extends keyof C & EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "delete">
  ): Promise<ResponseResolver<C, K, "delete">>;
  public delete<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "delete">
  ): Promise<ResponseResolver<C, K, "delete">>;
  public delete<K extends EndpointString>(
    ...[endpoint, body, params, headers]: RequestResolver<C, K, "delete">
  ) {
    return this.request(
      "delete",
      endpoint,
      body as RequestComponents["body"],
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "delete">>;
  }

  /**
   * Perform an OPTIONS request
   * @param {string} endpoint
   * @param {object} params
   * @param {object|array} headers
   * @returns {Promise}
   */
  public options<K extends keyof C & EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "options", true>
  ): Promise<ResponseResolver<C, K, "options">>;
  public options<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "options", true>
  ): Promise<ResponseResolver<C, K, "options">>;
  public options<K extends EndpointString>(
    ...[endpoint, params, headers]: RequestResolver<C, K, "options", true>
  ) {
    return this.request(
      "options",
      endpoint,
      undefined,
      params as RequestComponents["params"],
      headers as RequestComponents["headers"],
    ) as Promise<ResponseResolver<C, K, "options">>;
  }
}
