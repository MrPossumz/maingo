import type { Catalog } from "@/types.ts";
import type { Config } from "@/config.ts";
import { type ClientInstance, createClient } from "@/client.ts";

export interface LibraryInterface extends Config {
  Catalog: Catalog;
}

export default abstract class Library {
  abstract Config: Config;
  abstract Catalog: Catalog;

  #client!: ClientInstance<
    typeof this["Catalog"],
    typeof this["Config"]
  >;

  get client() {
    if (!this.#client) {
      this.#client = createClient(this.Config) as unknown as ClientInstance<
        typeof this["Catalog"],
        typeof this["Config"]
      >;
    }

    return this.#client;
  }
}
