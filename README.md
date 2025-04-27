Maingo is another HTTP client written for typescript. The library is intended to serve as an
extensible swiss army knife for client HTTP requests while squeezing as much out of typescript as it
can.

It relies on the [Fetch Web API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
power its requests. Middleware and taps are also supported.

Looking for a convenient way to just package up a reusable API client for a specific API while
avoiding the headaches of rolling your own auth logic or manually adding in type hinting? Maingo has
you covered with it's _Library_ utility.

# What Maingo Does Differently

- Get the most out of type hints regardless of the API you're connecting to! You can add type hints
  for any supported API protocol. Want to add one we don't support yet? Extend ours and write your
  own connector adapter or work with us to get it built!

- Package up APIs into convenient libraries which can be imported into other typescript repos for
  quick consumption. Start your own archive of APIs that you can just import into projects and start
  firing off. Writing your own API? Package it up as a library so your consumers can just import it
  and get all the benefits of your hard work, those freeloaders!

## ...What about tRPC?

Ideally this would work much like [tRPC](https://trpc.io/) where you have the benefit of type
hinting for requests and response. Unfortunately tRPC comes with some hard requirements.
Specifically, it requires that your API calls are going to a tRPC server. In situations where you
control the API and can implement tRPC then it is a terrific option but that's a minority of the
internet.

There's still widespread use of more traditional protocols such as
[RESTful](https://en.wikipedia.org/wiki/REST) and [SOAP](https://en.wikipedia.org/wiki/SOAP), as
well as the up and coming [GraphQL](https://graphql.org/). For those of us inheriting legacy
projects, or needing to interact with any of these other designs there's no equivalent tool to
improve the developer experience. Enter **Maingo**.

# Quick Start

In it's simplest form, Maingo simply a set of adapters that can be used to quickly scaffold the
infrastructure needed to reach out to a given api. Configuration is all handled through the _config_
options passed to `createClient`.

```ts
const client = createClient({
  connector: "REST", // The API type
  hostname: "http://numbersapi.com", // The API base URL
  auth: "none", // The authentication type of the API
});
```

After the client has been created then you can start using it to fire off requests. Any method
available to the connector can be used to fire off a request.

For example, the _REST_ connector can fire off any valid HTTP request such as GET, PUT, PATCH, POST,
etc.

```ts
// Once created the client can be used trigger requests.
client.get("/random/trivia/")
  .then((response) => response.text())
  .then((response) => console.log(response));
```

## Adding Type Hints

One of the main goals of the library is to allow the fetch api to better integrate with Typescript's
type system. To accomplish this the `createClient` method is a generic that can be passed a catalog
of endpoints along with some information about their supported methods, request and response types.

```ts
const client = createClient<{
  "/api/facts": {
    get: {
      request: { params: { number?: number } };
      response: ResponseJson<{ facts: string[]; success: boolean }>;
    };
  };
}>()({
  connector: "REST",
  hostname: "http://dog-api.kinduff.com",
  auth: "none",
});
```

The resulting client now benefits from the provided types and will provide auto-suggestions for
endpoints as well as type check the URL Search Params.

# Configuring the Client

Client functionality is all defined at the time of creation using the config options passed to
`createClient`. At minimum, a connector type and hostname are required.

```ts
export interface Config {
  /** The type of connector to use for all API calls. Currently
   * Rest and Graphql are supported. */
  connector: ConnectorType;
  /** The common hostname of the URI hosting the API endpoints. This
   * will be used as the base for all API endpoint calls. */
  hostname: string;
  /** The default headers to send with each request. These headers
   * will persist between each request. */
  headers?: Record<string, string>;
  /** The format to use when serializing search parameters. This
   * is only used on URL search parameters and largely concerns
   * formatting array parameters.
   *
   * PHP expects array parameters to be formatted similar to
   * formData using myArray[]=value1&myArray[]=value2. This is
   * contrary to the default browser behavior which uses comma
   * delimited.
   *
   * Default: 'delimited' */
  searchParamFormat?: "delimited" | "php";
  /** The authentication type to use for all API calls. */
  auth?: AuthType;
}
```

## Connectors

At this time only the REST connector is fully supported, however GraphQL is in the works and several
others are planned.

```ts
const client = createClient({
  connector: "REST" | "graphql",
  ...
});
```

## Adding in Authentication

The auth type is defined using the auth key on the config object. Each form of authentication may
require additional configuration data. See the respective sections of each auth type for more
information.

The current supported authentication methods are:

- Basic
- Bearer
- No-Auth
- OAuth2

# Libraries

A library works as a preconfigured client and catalog combination. It can be created and then
exported, making integration with an API a matter of a simple import.

```ts
export const CatFacts = Library<{
  "/facts": {
    get: {
      response: ResponseJson<{
        status: { verified: boolean; sentCount: number; feedback?: string };
        _id: string;
        user: string;
        text: string;
        __v: number;
        source: string;
        type: string;
        updatedAt: string;
        createdAt: string;
        deleted: boolean;
        used: boolean;
      }[]>;
    };
  };
}>()({
  connector: "REST",
  hostname: "https://cat-fact.herokuapp.com",
  auth: "none",
});
```

This library can then be consumed and immediately used to send requests.

```ts
import { CatFacts } from "./cat-facts.ts";

const catFacts = new CatFacts();

catFacts.client.get("/facts/")
  .then((res) => res.json())
  .then((res) => console.log(res));
```

Interested in just getting the types from the library? You can do that too!

```ts
const catFacts = new CatFacts();

type CatFactsCatalog = typeof catFacts.Catalog;
```

## Extending Libraries

# Authentication

## Basic

## Bearer

## No-Auth

## OAuth2
