import type { AuthConfigResolver, Config } from "@/config.ts";
import type { Catalog, ResponseText } from "@/types.ts";
import { type ClientInstance, createClient } from "@/client.ts";
import type { AuthType } from "@/auth/types.ts";

type WithAuth<C extends Partial<Config>> = C extends { auth: AuthType }
  ? C & Omit<AuthConfigResolver<C>, "auth">
  : C;

interface LibraryInterface<L extends Catalog, C extends Config> {
  Config: C;
  Catalog: L;
  client: ClientInstance<L, C>;
}

function Library<L extends Catalog>() {
  return function <C extends Config>(defaultConfig: C) {
    return class<C2 extends C> {
      public Config: C = defaultConfig;
      public Catalog!: L;

      #client!: ClientInstance<L, C>;

      constructor(config?: C2) {
        this.Config = config ? Object.assign({}, defaultConfig, config) : defaultConfig;
      }

      get client() {
        if (!this.#client) {
          this.#client = createClient(this.Config) as unknown as ClientInstance<
            L,
            C
          >;
        }

        return this.#client;
      }
    };
  };
}
const NumbersApi = Library<{
  "/random/trivia": {
    get: {
      response: ResponseText;
      errors: Record<string, never>;
    };
  };
  "/random/date": {
    get: {
      response: ResponseText;
      errors: Record<string, never>;
    };
  };
  "/random/year": {
    get: {
      response: ResponseText;
      errors: Record<string, never>;
    };
  };
  "/random/math": {
    get: {
      response: ResponseText;
      errors: Record<string, never>;
    };
  };
  [endpoint: `/${number}/trivia`]: {
    get: {
      // request: {};
      response: ResponseText;
      errors: Record<string, never>;
    };
  };
}>()({
  connector: "REST",
  hostname: "http://numbersapi.com",
  "auth": "basic",
  userId: "1",
  userPass: "2",
});
const y = new NumbersApi({ auth: "bearer", userId: "1", userPass: "2" });

type C = typeof y.Config;
y.client.auth;

type F = LibraryInterface<
  {
    "/random/trivia": {
      get: {
        response: ResponseText;
        errors: Record<string, never>;
      };
    };
    "/random/date": {
      get: {
        response: ResponseText;
        errors: Record<string, never>;
      };
    };
    "/random/year": {
      get: {
        response: ResponseText;
        errors: Record<string, never>;
      };
    };
    "/random/math": {
      get: {
        response: ResponseText;
        errors: Record<string, never>;
      };
    };
    [endpoint: `/${number}/trivia`]: {
      get: {
        // request: {};
        response: ResponseText;
        errors: Record<string, never>;
      };
    };
  },
  {
    connector: "REST";
    hostname: "http://numbersapi.com";
    // auth: "none",
  } & { "auth": "basic"; userId: "1"; userPass: "2" }
>["client"]["auth"];
