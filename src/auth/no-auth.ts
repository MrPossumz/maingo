import { createTypeGuard } from "guardis";
import type { Catalog } from "@/types.ts";
import { type Config, isConfig } from "@/config.ts";
import { AuthBase } from "./base.ts";
import type { RequestMap } from "@/middleware/types.ts";

export interface NoAuthConfig extends Config {
  auth: typeof NoAuth["type"];
}

export const isNoAuthConfig = createTypeGuard<NoAuthConfig>((v, has) => {
  if (isConfig(v) && has(v, "auth", (v) => v === "none")) {
    return v;
  }

  return null;
});

export default class NoAuth<L extends Catalog> extends AuthBase<L> {
  public static readonly type = "none";

  constructor(config: NoAuthConfig) {
    super(config);
  }

  getAuthentication(): RequestMap {
    return (next) => next();
  }
}
