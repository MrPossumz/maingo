import type { MaingoRequest, MaingoResponse, RequestHeaders, Stringable } from "../types.ts";
import type { Middleware } from "@/middleware-stack.ts";
import type { Client, ClientConfig } from "@/client.ts";
import { appendParamsDelimited, appendParamsIndexed } from "@/utils/url-search-params.ts";
import { Is } from "@/guards.ts";
import type { ConnectorConfigBase } from "@/connectors/index.ts";

export type MaingoConnector<
  Req extends MaingoRequest = MaingoRequest,
  Res extends MaingoResponse = MaingoResponse,
> = {
  /** The request type accepted by this connector. Some connectors may
   * narrow the type of request they accept. */
  REQUEST_TYPE: Req;
  /** The response type returned by this connector. Some connectors may
   * narrow the type of response they return. */
  RESPONSE_TYPE: Res;
  /**
   * Update a single header. These values will carry over with each api
   * call.
   * @param {string} name
   * @param {string} value
   * {@link ConnectorBase.setHeader}
   */
  setHeader(name: string, value: string | Stringable): void;
  /**
   * Remove a single header. This also searches any temporary headers
   * that may have been set for the current request and removes them if
   * a match is found.
   * @param {string} name
   * {@link ConnectorBase.removeHeader}
   */
  removeHeader(name: string): void;
};

export type ConnectorCall = (request: MaingoRequest) => Promise<MaingoResponse>;

export class ConnectorBase<C extends Partial<ClientConfig> & ConnectorConfigBase>
  implements MaingoConnector {
  /** Set by the service. */
  #headers: Headers = new Headers();
  /** Hard coded permanent headers. */
  #permanentHeaders = new Headers();

  /** Temporary hostname. This is reset after each call. */
  #tempHostname?: string | undefined;

  /** Used for debugging, logging and middleware. */
  #lastRequest?: Request;

  /** Used for debugging, logging and middleware. */
  #lastResponse?: Response;

  constructor(protected readonly config: C, private getMiddleware: () => Middleware[]) {}

  public REQUEST_TYPE!: MaingoRequest;
  public RESPONSE_TYPE!: MaingoResponse;

  /**
   * Retrieve the headers for the next call. This includes any headers
   * defined manually after instantiation of the client or permanent headers.
   * It does not include any temporary headers that may have been set
   * for the current request.
   */
  public get headers(): Headers {
    return new Headers([...this.#headers.entries(), ...this.#permanentHeaders.entries()]);
  }

  /**
   * Set headers on the connector. These will carry over after each call.
   * @param {object}
   */
  public set headers(headers: HeadersInit) {
    this.#headers = new Headers(headers);
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
   * Initialize the connector. This method is not implemented in the base class
   * and should be overridden in subclasses.
   *
   * It assigns the connector methods to the client/
   */
  public init(client: Client): Client & MaingoConnector {
    throw Error("Initialize method not implemented for connector");
  }

  /**
   * Update a single header. These values will carry over with each api
   * call.
   * @param {string} name
   * @param {string} value
   * {@link MaingoConnector.setHeader}
   */
  public setHeader(name: string, value: string | Stringable) {
    const _value = typeof value === "string" ? value : value.toString();

    this.#headers.set(name, _value);
  }

  /**
   * Remove a single header. This also searches any temporary headers
   * that may have been set for the current request and removes them if
   * a match is found.
   * @param name
   * {@link MaingoConnector.removeHeader}
   */
  public removeHeader(name: string): void {
    if (this.#headers.has(name)) {
      this.#headers.delete(name);
    }
  }

  /**
   * Trims leading and trailing slashes from the given endpoint string.
   *
   * @param endpoint - The endpoint string to be trimmed.
   * @returns The trimmed endpoint string without leading or trailing slashes.
   */
  private trimEndpoint(endpoint: string): string {
    if (endpoint.charAt(0) === "/") {
      endpoint = endpoint.substring(1);
    }

    if (endpoint.charAt(endpoint.length - 1) === "/") {
      endpoint = endpoint.substring(0, endpoint.length - 1);
    }

    return endpoint;
  }

  /**
   * Constructs a URL by combining the provided endpoint with the configured hostname
   * and optionally appending query parameters based on the specified format.
   *
   * @param endpoint - The endpoint path to append to the hostname. Defaults to an empty string.
   * @param params - Optional query parameters to append to the URL. The format of these
   *                 parameters depends on the `searchParamFormat` configuration.
   *                 - "delimited": Appends parameters in a delimited format.
   *                 - "indexed": Appends parameters in an indexed format.
   *
   * @returns A `URL` object representing the constructed URL.
   */
  protected buildUrl(endpoint = "", params?: MaingoRequest["params"]): URL {
    const _endpoint = this.trimEndpoint(endpoint);
    const _hostname = this.#tempHostname ?? this.config.hostname;

    const url = new URL(_endpoint, _hostname);

    if (params) {
      switch (this.config?.searchParamFormat) {
        case "delimited":
          appendParamsDelimited(url, params);
          break;

        case "indexed":
          appendParamsIndexed(url, params);
          break;
      }
    }

    return url;
  }

	/**
	 * Combines temporary headers, main headers, and permanent headers into a single `Headers` object.
	 *
	 * @param tempHeaders - Optional temporary headers to be merged with the main and permanent headers.
	 * @returns A new `Headers` object containing the merged headers.
	 */
  protected getHeaders(tempHeaders?: RequestHeaders) {
    const _tempHeaders = new Headers(tempHeaders);

    // merge temp headers with the main headers
    return new Headers([
      ...this.#headers.entries(),
      ..._tempHeaders.entries(),
      ...this.#permanentHeaders.entries(),
    ]);
  }

  /**
   * Constructs the request body for an HTTP request.
   *
   * @param body - The body of the request, which can be a JSON object, JSON array, or other types.
   *
   * @returns A `BodyInit` object if the body is a JSON object or array, or the original body if 
	 * 					it is of another type. Returns `undefined` if the input body is `null` or `undefined`.
   */
  protected buildBody(body: MaingoRequest["body"]): BodyInit | undefined {
    if (!body) return undefined;

    if (Is.JsonArray(body) || Is.JsonObject(body)) {
      return JSON.stringify(body);
    }

    return body ?? undefined;
  }

  /**
   * Prepares and processes a request before it is sent.
   *
   * This method sets up the necessary headers, constructs the request object,
   * and stores it as the last request for potential reuse or debugging purposes.
   * It also clones the request to ensure immutability when returning it.
   *
   * @param request - The `MaingoRequest` object containing the details of the request,
   * including the endpoint, parameters, headers, method, and body.
   *
   * @returns A cloned `Request` object that is ready to be sent.
   */
  protected preRequest(request: MaingoRequest): Request {
    this.#lastRequest = new Request(
      this.buildUrl(request.endpoint, request.params),
      {
        method: request.method?.toLowerCase() ?? "get",
        headers: this.getHeaders(request.headers),
        body: this.buildBody(request.body),
      },
    );

    return this.#lastRequest.clone();
  }

  /**
   * Handles the post-processing of a response after a request is made.
   *
   * This method resets temporary hostname and headers, clones the response
   * to store it as the last response, and returns the response augmented
   * with a `refire` property.
   *
   * @param res - The response object received from the request.
   * @param refire - A reference to the connector call that can be used to retry the request.
   *
   * @returns The response object extended with the `refire` property.
   */
  protected postRequest(res: Response, refire: ConnectorCall): MaingoResponse {
    // reset temp hostname
    this.#tempHostname = undefined;
    // set last response
    this.#lastResponse = res.clone();

    return Object.assign(res, { refire }) as MaingoResponse;
  }

  /**
   * Sends a request through a chain of middleware and ultimately performs the request using `fetch`.
   *
   * This method constructs a call stack by chaining middleware functions, where each middleware
   * can process the request and pass it to the next middleware in the chain. The final step in the
   * chain performs the actual HTTP request using `fetch` and processes the response.
   *
   * @param request - The `MaingoRequest` object containing the details of the request to be sent.
   * @returns A promise that resolves to a `MaingoResponse` object containing the response data.
   *
   * @remarks
   * - Middleware functions are applied in the order they are returned by `getMiddleware()`.
   * - The `preRequest` method is called before the request is sent to modify or prepare the request.
   * - The `postRequest` method is called after the response is received to process the response.
   */
  public request(request: MaingoRequest): Promise<MaingoResponse> {
    const callStack = this.getMiddleware()
      .reduce(
        (next: ConnectorCall, middleware) => (req: MaingoRequest) => middleware(req, next),
        (req: MaingoRequest) =>
          fetch(this.preRequest(req))
            .then((res) => this.postRequest(res, () => callStack(req))),
      ) as ConnectorCall;

    return callStack(request);
  }
}
