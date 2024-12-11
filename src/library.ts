import type { Config } from "./config.ts";
import type { Catalog } from "./types.ts";
import type { Assign } from "./utils/types.ts";
import { type ClientInstance, createClient } from "./client.ts";

/**
 * Create a library class dedicated to HTTP communication with a specific
 * library. Creation of the class requires the function to be invoked
 * twice in a row.
 *
 * The first invocation requires an endpoint catalog to be
 * passed as a type argument.
 *
 * The returned function requires a configuration object and will
 * return a class definition.
 * @returns
 *
 * @example
 * const classBlueprint = Library<{
 * "/api/facts": {
 * 		get: {
 * 			request: { params: { number?: number } };
 * 			response: ResponseJson<{ facts: string[]; success: boolean }>;
 * 			errors: Record<string, never>;
 * 			};
 * 		};
 * 	}>()({
 * 	connector: "REST",
 * 	hostname: "http://dog-api.kinduff.com",
 * });
 */
export default function Library<L extends Catalog>() {
  return function <C extends Config>(defaultConfig: Readonly<C>) {
    return class<
      C2 extends Omit<Config, "hostname" | "auth">,
      C3 extends Assign<C, C2>,
    > {
      public Config = defaultConfig;
      public Catalog!: L;

      #client!: ClientInstance<L, C3>;

      constructor(config?: C2) {
        if (config) {
          if ("hostname" in config) {
            throw Error("Cannot extend library by overwriting the hostname.");
          }

          if ("auth" in config) {
            throw Error("Cannot extend library by overwriting the auth type.");
          }
        }

        this.Config = config ? Object.assign({}, defaultConfig, config) : defaultConfig;
      }

      /**
       * Extend an existing library by either completely replacing
       * the existing default configuration or by passing a callback to
       * modify the current default configuration.
       * @param {object} newConfig
       * @returns
       */
      static extend<C4 extends Config>(newConfig: Readonly<C4> | ((defaultConfig: C) => C4)) {
        return Library<L>()(typeof newConfig === "function" ? newConfig(defaultConfig) : newConfig);
      }

      /** Retrieve the library client, allowing you to perform api calls to the target system. */
      get client() {
        if (!this.#client) {
          this.#client = createClient(this.Config) as unknown as ClientInstance<L, C3>;
        }

        return this.#client;
      }

      /** The library base url. */
      get hostname() {
        return this.Config.hostname;
      }
    };
  };
}
