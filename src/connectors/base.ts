import type {
  Catalog,
  HTTPMethods,
  RequestBody,
  RequestHeaders,
  RequestParams,
  Stringable,
} from "../types.ts";
import { formatSearchParamPHP, isValidUrl } from "../utils/url.ts";
import type MiddlewareStack from "../middleware/middleware-stack.ts";
import { Is } from "../guards.ts";
import type { Config } from "../config.ts";
import type { Client } from "../client.ts";

export abstract class ConnectorBase<L extends Catalog> {
  /** The middleware stack */
  #middleware!: MiddlewareStack;

  /** Set by the service. */
  #headers: Record<string, string> = {};
  /** Reset between calls. */
  #tempHeaders: Record<string, string> = {};
  /** Hard coded permanent headers. */
  #permanentHeaders: Record<string, string> = {};

  /** Temporary hostname. This is reset after each call. */
  #tempHostname?: string | undefined;

  /** Used for debugging, logging and middleware. */
  #lastRequest?: Request;
  /** Used for debugging, logging and middleware. */
  #lastResponse?: Response;

  constructor(protected config: Config) {}

  /** Assigns the connector methods to the client so that users don't have to use
   * `client.connector` to perform a call. You can simply call `client.post` or
   * `client.query`. */
  public abstract initializeClient<T extends Client<L, C>, C extends Config>(client: T): T;

  /**
   * Retrieve the instance of the middleware stack.
   * @returns {object}
   */
  public get middleware() {
    return this.#middleware;
  }

  /**
   * Set the middleware stack on the connector.
   * @param {object}
   */
  public set middleware(middleware: MiddlewareStack) {
    this.#middleware = middleware;
  }

  /**
   * Retrieve the headers for the next call. This includes any headers
   * defined on instantiation of the client, permanent headers and temporary
   * headers the exist for individual calls.
   */
  public get headers() {
    return {
      ...this.#headers,
      ...this.#tempHeaders,
      ...this.#permanentHeaders,
    };
  }

  /**
   * Set headers on the connector. These will carry over after each call.
   * @param {object}
   */
  public set headers(headers: Record<string, string>) {
    this.#headers = headers;
  }

  /**
   * Retrieve a record of the last api call performed
   * @returns {object}
   */
  public get lastRequest() {
    return this.#lastRequest ? this.#lastRequest.clone() : undefined;
  }

  /**
   * Retrieve a record of the last api call's response
   * @returns {Response}
   */
  public get lastResponse() {
    return this.#lastResponse ? this.#lastResponse.clone() : undefined;
  }

  /**
   * Update a single header. These values will carry over with each api
   * call.
   * @param {string} name
   * @param {string} value
   */
  public setHeader(name: string, value: string | Stringable) {
    const _value = typeof value === "string" ? value : value.toString();

    this.#headers[name] = _value;
  }

  /**
   * Appends the formatted search param to the URL
   * @param {string} key
   * @param {string} value
   * @param {URL} url
   */
  protected formatSearchParam(
    key: string,
    value: string | Stringable,
    url: URL,
  ) {
    switch (this.config.searchParamFormat) {
      case "delimited":
        url.searchParams.append(key, value.toString());
        break;

      case "php":
        formatSearchParamPHP(key, value, url);
        break;
    }
  }

  /**
   * Combines the base and endpoint to create a URL. Appends
   * the URL search params if any are provided.
   * @param {string} endpoint
   * @param {object} params
   * @returns {URL}
   */
  protected buildUrl(
    endpoint: string,
    params: RequestParams = {},
  ) {
    const url = new URL(endpoint, this.#tempHostname ?? this.config.hostname);

    if (!isValidUrl(url.toString())) {
      throw new Error(`Invalid URL: ${url.toString()}`);
    }

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (!key?.toString) {
          throw new Error(
            `Invalid URL Search Param key type. Found: "${typeof key}"`,
          );
        }

        if (!value?.toString) {
          throw new Error(
            `Invalid URL Search Param value type. Found: "${typeof value}"`,
          );
        }

        this.formatSearchParam(key, value, url);
      }
    }

    return url;
  }

  /**
   * Forces the body to be compatible with the Fetch API's
   * BodyInit type.
   * @param body
   * @returns
   */
  protected buildBody(body: RequestBody): BodyInit | null {
    if (Is.JsonArray(body) || Is.JsonObject(body)) {
      return JSON.stringify(body);
    }

    return body ?? null;
  }

  /**
   * Logic applied before every request.
   * @param {string} method - The HTTP Method to use
   * @param {string} endpoint - The endpoint to target
   * @param {string|object|array|undefined} body - The body to send
   * @param {object|undefined} params - The query parameters to send
   * @param {object|array|undefined} headers - Any temporary headers to include
   * @returns {void}
   */
  protected async preRequest(
    method: HTTPMethods,
    endpoint: string,
    body?: RequestBody,
    params?: RequestParams,
    headers?: HeadersInit,
  ) {
    // Standardize the endpoint
    if (endpoint.charAt(0) === "/") endpoint = endpoint.substring(1);

    // Set temporary headers
    if (headers) {
      const tempHeaders = new Headers(headers);

      this.#tempHeaders = Object.fromEntries(tempHeaders.entries());
    } else {
      this.#tempHeaders = {};
    }

    body ??= null;

    // Apply request map.
    const components = await this.#middleware.applyRequestMap({
      body,
      params,
      headers: this.headers,
    });

    this.#lastRequest = new Request(this.buildUrl(endpoint, components.params), {
      method,
      headers: components.headers,
      body: this.buildBody(components.body),
    });
  }

  /**
   * Perform the API request
   * @param {string} method - The HTTP Method to use
   * @param {string} endpoint - The endpoint to target
   * @param {string|object|array|undefined} body - The body to send
   * @param {object|undefined} params - The query parameters to send
   * @param {object|array|undefined} headers - Any temporary headers to include
   * @returns {Response}
   */
  protected async request(
    method: HTTPMethods,
    endpoint: string,
    body?: RequestBody,
    params: RequestParams = {},
    headers: RequestHeaders = {},
  ) {
    await this.preRequest(method, endpoint, body, params, headers);

    await fetch(this.#lastRequest!.clone())
      .then((res) => this.postRequest(res))
      .catch((e: Error) => console.error(e));

    // Apply any middleware pre-request taps
    await this.#middleware.applyRequestTap(this.#lastRequest!.clone(), () => {});

    return this.#lastResponse!.clone();
  }

  /**
   * After request cleanup and caching logic.
   * @returns
   */
  protected async postRequest(response: Response | Error) {
    // reset temp hostname
    this.#tempHostname = undefined;

    if (response instanceof Error) {
      this.#lastResponse = undefined;
      throw response;
    }

    this.#lastResponse = response;

    this.#middleware.applyResponseTap(
      this.#lastResponse.clone(),
      this.#lastRequest!.clone(),
    );

    // // should this actually be before the response tap above?
    this.#lastResponse = await this.#middleware.applyResponseMap(
      this.#lastRequest!.clone(),
      this.#lastResponse.clone(),
    );
  }

  public refire(): Promise<Response> {
    const lastRequest = this.#lastRequest!;

    const url = new URL(lastRequest.url);
    const endpoint = `${url.protocol}//${url.host}${url.pathname}`
      .substring(this.config.hostname.length);

    return this.request(
      lastRequest.method as HTTPMethods,
      endpoint,
      lastRequest.body,
      url.searchParams.entries(),
      this.#tempHeaders,
    );
  }
}
