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
export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export interface MaingoRequest {
  endpoint?: string;
  method?: HTTPMethods | Uppercase<HTTPMethods>;
  body?: RequestBody;
  params?: Record<string, JsonValue>;
  headers?: RequestHeaders;
}

export type MaingoResponse = Response & { refire: () => Promise<MaingoResponse> };

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

/** The possible body types that can be included in the response. */
type ResponseBodyTypes =
  | "arrayBuffer"
  | "blob"
  | "bytes"
  | "formData"
  | "json"
  | "text";

export type RequestBody =
  | Blob
  | BufferSource
  | FormData
  | URLSearchParams
  | string
  | ReadableStream<Uint8Array>
  | Iterable<Uint8Array>
  | AsyncIterable<Uint8Array>
  | JsonArray
  | JsonObject
  | null;

export type RequestHeaders = Record<string, string>;
