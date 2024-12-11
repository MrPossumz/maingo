import { createTypeGuard, Is } from "../../deps.ts";
import type { Catalog } from "../types.ts";
import NoAuth from "./no-auth.ts";
import BasicAuth from "./basic.ts";
import BearerAuth from "./bearer.ts";
import OAuth2 from "./oauth2.ts";

export interface AuthConfig {
  auth: AuthType;
}

export type AuthType =
  | typeof NoAuth<Catalog>["type"]
  | typeof BasicAuth<Catalog>["type"]
  | typeof BearerAuth<Catalog>["type"]
  | typeof OAuth2<Catalog>["type"]
  | undefined;

export const isAuthType = createTypeGuard<AuthType>((v) => {
  if (
    v && Is.String(v) &&
    (
      v === NoAuth.type || v === BasicAuth.type ||
      v === BearerAuth.type || v === OAuth2.type
    )
  ) {
    return v;
  }

  return null;
});
