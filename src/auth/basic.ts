import type { Catalog } from "@/types.ts";
import {  isConfig } from "@/config.ts";
import type { RequestMap } from "@/middleware/types.ts";
import { AuthBase } from "./base.ts";
import { createTypeGuard, Is } from "guardis";
import type { AuthConfig } from "@/auth/types.ts";

export interface BasicAuthConfig extends AuthConfig {
  auth: typeof BasicAuth["type"];
  userId: string;
  userPass: string;
}

export const isBasicAuthConfig = createTypeGuard<BasicAuthConfig>((v, has) => {
  if (
    isConfig(v) &&
    has(v, "auth", (v) => v === "basic") &&
    has(v, "userId", Is.String) &&
    has(v, "userPass", Is.String)
  ) {
    return v;
  }

  return null;
});

export default class BasicAuth<L extends Catalog> extends AuthBase<L> {
  declare protected config: BasicAuthConfig;

  public static readonly type = "basic";

  protected encodedCredentials?: string;

  constructor(config: BasicAuthConfig) {
    super(config);

    this.encodedCredentials = btoa(`${config.userId}:${config.userPass}`);
  }

  override getAuthentication(): RequestMap {
    return async (next) => {
      const components = await next();

      components.headers["Authorization"] = `Basic ${this.encodedCredentials}`;
      return components;
    };
  }
}
