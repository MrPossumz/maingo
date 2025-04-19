import type { Client } from "@/client.ts";
import type { Middleware } from "@/middleware-stack.ts";
import type { AuthMethods } from "./index.ts";

export interface AuthConfigBase {}

export abstract class AuthBase<C extends AuthConfigBase> implements AuthMethods {
  constructor(protected readonly config: C) {}

  /**
   * A callback used to patch in whatever authentication logic
   * is necessary for this auth type.
   * @returns
   */
  abstract getAuthentication(client: Client): Middleware;
}
