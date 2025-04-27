import type {
  HTTPMethods,
  JsonValue,
  RequestBody,
  RequestHeaders,
  ResponseArrayBuffer,
  ResponseBlob,
  ResponseFormData,
  ResponseJson,
  ResponseText,
  Stringable,
} from "@/types.ts";
import type { ConnectorType } from "@/connectors/types.ts";

type MaingoRequest = {
  body?: RequestBody;
  params?: Record<string, JsonValue>;
  headers?: RequestHeaders;
};

type MaingoRestRequest = {
  body?: RequestBody;
  params?: Record<string, JsonValue>;
  headers?: RequestHeaders;
};

type MaingoGraphqlRequest = MaingoRequest;

type MaingoResponse =
  | ResponseArrayBuffer
  | ResponseBlob
  | ResponseFormData
  | ResponseJson
  | ResponseText
  | Response;

type ResolveResponseType<R extends MaingoResponse> = R extends unknown
  ? MaingoResponse
  : R;

type BasicAuthConfig = {
  type: "basic" | "Basic";
  id: Stringable;
  secret: Stringable;
};

type BearerAuthConfig = {
  type: "bearer" | "Bearer";
  token: string;
};

type OAuth2Config = {
  type: "oauth2" | "OAuth2";
  scope?: string;
  clientId: Stringable;
  clientSecret: Stringable;
  grantType: string;
  accessTokenCallback: unknown;
  refreshTokenCallback: unknown;
};

interface MaingoConfig<
  Connector extends ConnectorType = ConnectorType,
  Headers extends RequestHeaders | undefined = undefined,
> {
  /**
   * The base URL on where each endpoint lives.
   */
  hostname: string;

  /**
   * The type of API protocol used for the connection.
   */
  connector: Connector;

  /**
   * The authentication configuration.
   */
  auth?: BasicAuthConfig | BearerAuthConfig | OAuth2Config;
  /**
   * Headers that will be included on every request made by the client.
   */
  headers?: Headers;
}

type MaingoConnector<
  Methods extends string,
  Req extends MaingoRequest = MaingoRequest,
  Res extends MaingoResponse = MaingoResponse,
> =
  & {
    [x in Methods]: (req: Req) => Promise<Res>;
  }
  & {
    REQUEST_TYPE: Req;
  };

class BaseConnector {
  public REQUEST_TYPE!: MaingoRequest;
}

interface MaingoRestConnector extends MaingoConnector<HTTPMethods, MaingoRestRequest> {
  post(req: MaingoRestRequest): Promise<MaingoResponse>;
  put(req: MaingoRestRequest): Promise<MaingoResponse>;
  patch(req: MaingoRestRequest): Promise<MaingoResponse>;
  delete(req: MaingoRestRequest): Promise<MaingoResponse>;
  options(req: MaingoRestRequest): Promise<MaingoResponse>;
  head(req: MaingoRestRequest): Promise<MaingoResponse>;
  connect(req: MaingoRestRequest): Promise<MaingoResponse>;
  trace(req: MaingoRestRequest): Promise<MaingoResponse>;
  get(req: MaingoRestRequest): Promise<MaingoResponse>;
}

class RestConnector extends BaseConnector implements MaingoRestConnector {
  declare public REQUEST_TYPE: MaingoRestRequest;
  declare public METHODS: HTTPMethods;

  public async post(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async put(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async patch(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async delete(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async options(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async head(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async connect(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async trace(req: MaingoRestRequest): Promise<MaingoResponse> {}

  public async get(req: MaingoRestRequest): Promise<MaingoResponse> {}
}

interface MaingoGraphqlConnector extends MaingoConnector<"query", MaingoGraphqlRequest> {
  query(req: MaingoGraphqlRequest): Promise<MaingoResponse>;
}

class GraphqlConnector extends BaseConnector implements MaingoGraphqlConnector {
  declare public REQUEST_TYPE: MaingoGraphqlRequest;
  declare public METHODS: "query";

  public async query(req: MaingoGraphqlRequest): Promise<MaingoResponse> {}
}

type ConnectorResolver<T extends ConnectorType> = T extends "REST" ? RestConnector
  : T extends "Graphql" ? GraphqlConnector
  : never;

type ConcatString<U, T extends string> = U extends string ? U | T : T;

interface MaingoClient<Middleware extends string | undefined = undefined> {
  new (config: MaingoConfig): MaingoClient;

  /** Utility type to view the keys of middleware loaded on the client. */
  readonly Middleware: Middleware;

  /**
   * @param key
   * @param middleware
   */
  addMiddleware<K extends string>(
    key: K,
    middleware: MaingoMiddleware,
  ): MaingoClient<ConcatString<Middleware, K>>;

  /**
   * @param key
   */
  removeMiddleware<K extends Middleware & string>(key: K): MaingoClient<Exclude<Middleware, K>>;
}

class Client {}

type MaingoMiddleware<
  Req extends MaingoRequest = MaingoRequest,
  Res extends MaingoResponse = MaingoResponse,
> = (
  req: Req,
  client: MaingoClient,
) => Promise<Res>;

function createClient<
  Connector extends ConnectorType,
  Headers extends RequestHeaders | undefined,
>(config: MaingoConfig<Connector, Headers>): MaingoClient & ConnectorResolver<Connector> {}

const a = createClient({
  hostname: "http://api.com",
  connector: "Graphql",
});

const c = new RestConnector();
c.get();

a.query({
  path: "",
  body: "",
});

interface Library<
  Connector extends ConnectorType,
  Endpoints extends keyof EndpointRecs & string,
  EndpointRecs extends EndpointRecords<Connector, Endpoints>,
  Headers extends RequestHeaders | undefined,
> extends MaingoConfig<Connector, Headers> {
	/**
	 * A collection of endpoints available to be called in the library, along
	 * with definitions for their request and response structures.
	 */
  readonly endpoints: EndpointRecs;
}

type NeverUnknown<T> = T extends unknown ? never : T;

type MapLibraryToClient<
  Connector extends ConnectorType,
  Endpoints extends keyof EndpointRecs & string,
  EndpointRecs extends EndpointRecords<Connector, Endpoints>,
  Headers extends RequestHeaders | undefined,
  Lib extends Library<Connector, Endpoints, EndpointRecs, Headers> = Library<
    Connector,
    Endpoints,
    EndpointRecs,
    Headers
  >,
> =
  & {
    readonly meta: {
      readonly hostname: Lib["hostname"];
      readonly connector: Lib["connector"];
      readonly headers: Headers;
    };
  }
  & {
    [Key in Endpoints]: Lib["endpoints"][Key] extends { request: any }
      ? (
        req: Lib["endpoints"][Key]["request"],
      ) => Promise<ResolveResponseType<Lib["endpoints"][Key]["response"]>>
      : () => Promise<ResolveResponseType<Lib["endpoints"][Key]["response"]>>;
  };

// function createRequest<
//   S extends string,
//   B extends RequestBody | undefined | never,
// >(req: { endpoint: S; body: B }): { endpoint: S; body: B };
// function createRequest<
//   S extends string,
//   B extends RequestBody | undefined | never,
//   P extends Record<string, JsonValue> | undefined | never,
//   H extends RequestHeaders | undefined | never,
// >(
//   req: { endpoint: S; body: B; params: P; headers: H },
// ): { endpoint: S; body: B; params: P; headers: H };
// function createRequest<
//   S extends string,
//   B extends RequestBody | undefined | never,
//   P extends Record<string, JsonValue> | undefined | never,
//   H extends RequestHeaders | undefined | never,
// >(
//   req: { endpoint: S; body: B; params: P; headers: H },
// ): { endpoint: S; body: B; params: P; headers: H } {}

type FilterForMethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

// type EndpointRecords<
//   Connector extends ConnectorType,
//   Endpoints extends string,
//   ConnectorClass extends ConnectorResolver<Connector> = ConnectorResolver<Connector>,
// > = {
//   [Key in Endpoints]: {
//     method: ConnectorClass["METHODS"];
//     request: Omit<ConnectorClass["REQUEST_TYPE"], "path">;
//     response?: MaingoResponse;
//     path?: string;
//   };
// };

// function createLibrary<
//   Connector extends "Graphql",
//   Endpoints extends keyof EndpointRecs & string,
//   EndpointRecs extends EndpointRecords<"Graphql", Endpoints>,
//   Headers extends RequestHeaders | undefined,
// >(
//   library: Library<Connector, Endpoints, EndpointRecs, Headers>,
// ): MapLibraryToClient<Connector, Endpoints, EndpointRecs, Headers>;
// function createLibrary<
//   Connector extends "REST",
//   Endpoints extends keyof EndpointRecs & string,
//   EndpointRecs extends EndpointRecords<"REST", Endpoints>,
//   Headers extends RequestHeaders | undefined,
// >(
//   library: Library<Connector, Endpoints, EndpointRecs, Headers>,
// ): MapLibraryToClient<Connector, Endpoints, EndpointRecs, Headers>;
// function createLibrary<
//   Connector extends ConnectorType,
//   Endpoints extends keyof EndpointRecs & string,
//   EndpointRecs extends EndpointRecords<Connector, Endpoints>,
//   Headers extends RequestHeaders | undefined,
// >(
//   library: Library<Connector, Endpoints, EndpointRecs, Headers>,
// ): MapLibraryToClient<Connector, Endpoints, EndpointRecs, Headers>;
// function createLibrary<
//   Connector extends ConnectorType,
//   Endpoints extends keyof EndpointRecs & string,
//   EndpointRecs extends EndpointRecords<Connector, Endpoints>,
//   Headers extends RequestHeaders | undefined,
// >(
//   library: Library<Connector, Endpoints, EndpointRecs, Headers>,
// ): MapLibraryToClient<Connector, Endpoints, EndpointRecs, Headers> {}

const abc = createLibrary({
  hostname: "",
  connector: "REST",
  headers: {},
  endpoints: {
    "endpointA": {
      method: "query",
      request: {
        body: { jsonKey: "val" },
        params: {
          urlString: "some string",
        },
      },
    },
    "endpointB": {
      method: "post",
      body: { num: 3 },
    },
  },
});

type TFA = ConnectorResolver<"REST">;
type GED = TFA["REQUEST_TYPE"];
type ABC = typeof abc;
abc.endpointA();
abc.endpointB();
abc.meta.connector;
const textLib = {} as unknown as typeof abc;
