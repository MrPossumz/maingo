import { createTypeGuard } from "../../deps.ts";
import type { Catalog } from "../types.ts";
import { AuthBase } from "./base.ts";
import type { RequestMap } from "../middleware/types.ts";
import type { AuthConfig } from "./types.ts";

export interface NoAuthConfig extends AuthConfig {
  auth: typeof NoAuth["type"];
}

export const isNoAuthConfig = createTypeGuard<NoAuthConfig>((v, has) => {
  if (v && typeof v === "object" && has(v, "auth", (v) => v === "none")) {
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
