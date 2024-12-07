import { createTypeGuard, Is } from "guardis";
import type { Catalog } from "@/types.ts";
import type { RequestMap } from "@/middleware/types.ts";
import { AuthBase } from "./base.ts";
import type { AuthConfig } from "@/auth/types.ts";

export interface BearerAuthConfig extends AuthConfig {
  auth: typeof BearerAuth["type"];
  token: string;
}

export const isBearerAuthConfig = createTypeGuard<BearerAuthConfig>((v, has) => {
  if (
    v && typeof v === "object" &&
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
