import { createTypeGuard, Is } from "guardis";
import type { Catalog } from "@/types.ts";
import { type Config, isConfig } from "@/config.ts";
import type { RequestMap } from "@/middleware/types.ts";
import { AuthBase } from "./base.ts";

export interface BearerAuthConfig extends Config {
  auth: typeof BearerAuth["type"];
  token: string;
}

export const isBearerAuthConfig = createTypeGuard<BearerAuthConfig>((v, has) => {
  if (
    isConfig(v) &&
    has(v, "auth", (v) => v === "bearer") &&
    has(v, "token", Is.String)
  ) {
    return v;
  }

  return null;
});

export default class BearerAuth<L extends Catalog> extends AuthBase<L> {
  declare protected config: BearerAuthConfig;

  public static readonly type = "bearer";

  constructor(config: BearerAuthConfig) {
    super(config);
  }

  override getAuthentication(): RequestMap {
    return async (next) => {
      const components = await next();

      components.headers["Authorization"] = `Bearer ${this.config.token}`;
      return components;
    };
  }
}
