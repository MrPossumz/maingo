import type { REST, RestCatalog } from "@/connectors/rest.ts";
import type { Graphql } from "@/connectors/graphql.ts";
import type {
  Call,
  Catalog,
  EndpointString,
  GraphqlMethods,
  HTTPMethods,
  RequestBody,
  RequestComponents,
  RequestHeaders,
  RequestParams,
  ResponseStripped,
} from "@/types.ts";

export type ConnectorType = typeof REST["type"] | typeof Graphql["type"];

export type RequestPropertyResolver<
  L extends RestCatalog,
  K extends keyof L,
  M extends HTTPMethods | GraphqlMethods,
  P extends keyof RequestComponents,
> = L[K] extends Record<M, Call>
  ? L[K][M] extends Call ? P extends keyof L[K][M]["request"] ? L[K][M]["request"][P]
    : undefined
  : undefined
  : undefined;

export type SimpleRequestResolver<
  L extends Catalog,
  K extends keyof L | string,
  M extends HTTPMethods | GraphqlMethods,
> = K extends keyof L
  ? RequestPropertyResolver<L, K, M, "headers"> extends undefined
    ? RequestPropertyResolver<L, K, M, "params"> extends undefined ? [
        endpoint: K,
        params?: RequestPropertyResolver<L, K, M, "params">,
        headers?: RequestPropertyResolver<L, K, M, "headers">,
      ]
    : [
      endpoint: K,
      params: RequestPropertyResolver<L, K, M, "params">,
      headers?: RequestPropertyResolver<L, K, M, "headers">,
    ]
  : [
    endpoint: K,
    params: RequestPropertyResolver<L, K, M, "params">,
    headers: RequestPropertyResolver<L, K, M, "headers">,
  ]
  : [
    endpoint: K,
    params?: RequestParams,
    headers?: RequestHeaders,
  ];

export type RequestResolver<
  L extends Catalog,
  K extends (keyof L & EndpointString) | string,
  M extends HTTPMethods | GraphqlMethods,
  Simple extends boolean = false,
> = Simple extends true ? SimpleRequestResolver<L, K, M>
  : K extends keyof L
    ? K extends EndpointString
      ? RequestPropertyResolver<L, K, M, "headers"> extends undefined
        ? RequestPropertyResolver<L, K, M, "params"> extends undefined
          ? RequestPropertyResolver<L, K, M, "body"> extends undefined
            ? L[K] extends undefined ? DefaultParams<K>
            : [
              endpoint: K,
              body?: RequestPropertyResolver<L, K, M, "body">,
              params?: RequestPropertyResolver<L, K, M, "params">,
              headers?: RequestPropertyResolver<L, K, M, "headers">,
            ]
          : [
            endpoint: K,
            body: RequestPropertyResolver<L, K, M, "body">,
            params?: RequestPropertyResolver<L, K, M, "params">,
            headers?: RequestPropertyResolver<L, K, M, "headers">,
          ]
        : [
          endpoint: K,
          body: RequestPropertyResolver<L, K, M, "body">,
          params: RequestPropertyResolver<L, K, M, "params">,
          headers?: RequestPropertyResolver<L, K, M, "headers">,
        ]
      : [
        endpoint: K,
        body: RequestPropertyResolver<L, K, M, "body">,
        params: RequestPropertyResolver<L, K, M, "params">,
        headers: RequestPropertyResolver<L, K, M, "headers">,
      ]
    : never
  : DefaultParams<K>;

export type DefaultParams<K extends string> = [
  endpoint: K,
  body?: RequestBody,
  params?: RequestParams,
  headers?: RequestHeaders,
];

export type ResponseResolver<
  L extends Catalog,
  K extends (keyof L & EndpointString) | string,
  M extends HTTPMethods | GraphqlMethods,
> = K extends keyof L
  ? K extends EndpointString ? L[K][M]["response"] extends ResponseStripped ? L[K][M]["response"]
    : Response
  : never
  : Response;
