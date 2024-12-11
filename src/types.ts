import type { ClientErrorStatus, ServerErrorStatus } from "jsr:@std/http";
import type { RestCatalog, RestMethodsInterface } from "./connectors/rest.ts";
import type { GraphqlCatalog, GraphqlMethodsInterface } from "./connectors/graphql.ts";
import type { ExcludeFromUnion } from "./utils/types.ts";
import type { SearchParams } from "./search-params.ts";

/**	Matches a JSON object. */
export type JsonObject =
  & { [Key in string]: JsonValue }
  & {
    [Key in string]?: JsonValue | undefined;
  };

/**	Matches a JSON array.	*/
export type JsonArray = JsonValue[] | readonly JsonValue[];

/**	Matches any valid JSON primitive value. */
export type JsonPrimitive = string | number | boolean | null;

/**	Matches any valid JSON value. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** JavaScript type that can be converted to a string. */
export type Stringable<T = unknown> = T & { toString: () => string };

/** Converts any readonly keys on a type to writeable. */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

/** Valid Api methods. */
export type HTTPMethods =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head"
  | "connect"
  | "trace";

export type GraphqlMethods = "query";

/** Valid constructory types for SearchParams */
export type SearchParamsInit =
  | URLSearchParams
  | { [x: string]: Stringable }
  | Exclude<ConstructorParameters<typeof SearchParams>[0], (string)[][]>
  | [Stringable, Stringable][];

export type StdRequestComponents = {
  body: RequestBody;
  params: RequestParams;
  headers: Record<string, string>;
};

/** The possible body types that can be included in the response. */
type ResponseBodyTypes =
  | "arrayBuffer"
  | "blob"
  | "bytes"
  | "formData"
  | "json"
  | "text";

/** The fetch API response stripped of it's body methods. */
export type ResponseStripped = {
  [
    key in keyof Omit<
      Response,
      ResponseBodyTypes
    >
  ]: key extends ResponseBodyTypes ? never : Response[key];
};

/** Narrow down the response type to hint at what method _should_
 * be used to digest the body. */
export type ResponseNarrowed<
  T extends (string & ResponseBodyTypes) | void,
> = T extends void ? T
  : Omit<
    Response,
    ExcludeFromUnion<T, ResponseBodyTypes>
  >;

/** An API response that should be interpreted as an array buffer type. */
export type ResponseArrayBuffer = ResponseNarrowed<"arrayBuffer">;
/** An API response that should be interpreted as a blob type. */
export type ResponseBlob = ResponseNarrowed<"blob">;
/** An API response that should be interpreted as a Uint8array. */
export type ResponseBytes = ResponseNarrowed<"bytes">;
/** An API response that should be interpreted as a FormData type. */
export type ResponseFormData = ResponseNarrowed<"formData">;
/** An API response that should be parsed as json. */
export type ResponseJson<J = unknown> = ResponseStripped & {
  json(): Promise<J>;
  text(): Promise<string>;
};
/** An API response that should be parsed as text. */
export type ResponseText<T = string> = ResponseStripped & { text(): Promise<T> };

export type ResponseResolver<T> = T extends string ? ResponseText<T>
  : T extends JsonObject ? ResponseJson<T>
  : T extends string ? ResponseText<T>
  : Response;

export type RequestParams = SearchParamsInit | null;

export type RequestBody =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string
  | ReadableStream
  | JsonArray
  | JsonObject
  | null;

export type RequestHeaders =
  | Headers
  | [string, string][]
  | Record<string, string>;

export type RequestComponents = {
  params: RequestParams;
  body: RequestBody;
  headers: RequestHeaders;
};

export type Call = {
  request?: RequestComponents | Partial<RequestComponents> | undefined;
  response:
    | ResponseArrayBuffer
    | ResponseBlob
    | ResponseFormData
    | ResponseJson
    | ResponseText
    | unknown;
  errors?: {
    [key in (ClientErrorStatus | ServerErrorStatus)]?: string | string[];
  };
};

export type EndpointString = `/${string}`;

/** A list of available API calls. */
export interface Catalog {
  [x: EndpointString]: { [x: string]: Call };
}

/** Given an interface extending Library, return the subset of methods
 * allowed for the library type. */
export type MethodResolver<L extends Catalog> = L extends RestCatalog ? HTTPMethods
  : L extends GraphqlCatalog ? GraphqlMethods
  : string;

export type MethodInterfaceResolver<L extends Catalog> = L extends RestCatalog
  ? RestMethodsInterface<L>
  : L extends GraphqlCatalog ? GraphqlMethodsInterface<L>
  : never;
