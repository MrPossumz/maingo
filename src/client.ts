import type { Catalog, MethodInterfaceResolver } from "./types.ts";
import type { Config, ConfigResolver } from "./config.ts";
import type { ConnectorBase } from "./connectors/base.ts";
import type { RestCatalog, RestConnectorConfig } from "./connectors/rest.ts";
import type { GraphqlCatalog, GraphqlConnectorConfig } from "./connectors/graphql.ts";
import { type ConnectorResolver, createConnector } from "./connectors/index.ts";
import { type AuthResolver, createAuthAdapter } from "./auth/index.ts";
import MiddlewareStack from "./middleware/middleware-stack.ts";

/**
 * An HTTP client used to perform API calls. Can be instantiated using
 * a Library type to provide type hinting on endpoint calls.
 *
 * The client must be provided a config which controls client and
 * authentication behavior.
 */
export class Client<
  L extends Catalog,
  C extends Config = ConfigResolver<L>,
> {
  #config: C;
  #auth: AuthResolver<L, C>;
  #connector: ConnectorResolver<L, C>;

  constructor(config: C) {
    config.auth ??= "none";
    config.searchParamFormat ??= "delimited";

    this.#config = Object.freeze(config);

    this.#auth = this.#buildAuthAdapter();
    this.#connector = this.#buildConnectorAdapter();

    const middleware = new MiddlewareStack();
    this.#connector.middleware = middleware;

    this.tap = middleware.tap.bind(middleware);
    this.pushMiddleware = middleware.push.bind(middleware);
    this.setHeader = this.#connector.setHeader.bind(this.#connector);
  }

  /** Creates an auth adapter from the instance config object. */
  #buildAuthAdapter() {
    const auth = createAuthAdapter(this.#config);

    if (!auth) {
      throw Error("Failed to generate an auth adapter from the provided config.");
    }

    return auth as AuthResolver<L, C>;
  }

  /** Create a connector adapter from the instance config object. */
  #buildConnectorAdapter() {
    const connector = createConnector(this.#config);

    if (!connector) {
      throw Error("Failed to generate a connector from the provided config.");
    }

    return connector as ConnectorResolver<L, C>;
  }

  /**
   * Returns a readonly copy of the config object used to create the client.
   * @returns {object}
   */
  get config(): Readonly<C> {
    return this.#config;
  }

  /**
   * Returns a reference to the auth adapter generated from the configuration
   * object.
   * @returns {object}
   */
  get auth(): AuthResolver<L, C> {
    return this.#auth;
  }

  /**
   * Returns a reference to the connector adapter generated from the
   * configuration object.
   * @returns {object}
   */
  get connector() {
    return this.#connector;
  }

  /**
   * Tap into the middleware stack using callbacks. The callback will
   * receive a cloned copy of the response and/or request. Changes made
   * to the request will not carry over to the API call or persist in
   * the final returned response.
   *
   * Taps are invoked in the order they are added, from the outermost
   * going inward.
   *
   * Requests and Responses are passed to taps after the middleware has
   * been applied.
   * @param {function} tap
   * @returns {function}
   */
  public tap: MiddlewareStack["tap"];

  /**
   * Push a mapping callback into the stack. Callbacks may map
   * either the request or response objects of the api call.
   *
   * Maps are invoked in the order they are added, from the outermost
   * going inward.
   * @param {string} type
   * @param {function} fn
   * @returns {function}
   */
  public pushMiddleware: MiddlewareStack["push"];

  /**
   * Update a single header. These values will carry over with each api
   * call.
   * @param {string} name
   * @param {string} value
   */
  public setHeader: ConnectorBase<L>["setHeader"];

  /**
   * Defines the headers on the connector. These will carry over between
   * api calls. Overrides any existing headers that have been defined
   * in this way.
   * @param {object} headers
   */
  public setHeaders(headers: Record<string, string>) {
    this.#connector.headers = headers;
  }

  _initialize(): this & MethodInterfaceResolver<L> {
    return this.#connector.initializeClient(this) as this & MethodInterfaceResolver<L>;
  }
}

type LibraryResolver<C extends Config> = C extends RestConnectorConfig ? RestCatalog
  : C extends GraphqlConnectorConfig ? GraphqlCatalog
  : Catalog;

export type ClientInstance<L extends Catalog, C extends Config> =
  & Client<L, C>
  & MethodInterfaceResolver<L>;

export function createClient<L extends Catalog, C extends Config = ConfigResolver<L>>(): <
  C extends ConfigResolver<L>,
>(config: C) => ClientInstance<L, C>;
export function createClient<C extends Config>(config: C): ClientInstance<LibraryResolver<C>, C>;
export function createClient<L extends Catalog, C extends Config = ConfigResolver<L>>(config?: C) {
  if (config) return new Client<L, C>(config)._initialize();

  return <C extends ConfigResolver<L>>(config: C) => new Client<L, C>(config)._initialize();
}
