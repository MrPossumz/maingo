import { type AuthConfig, type AuthMethods, getAuth } from "@/core/auth/index.ts";
import type { MaingoGraphqlConnector } from "@/core/connectors/graphql.ts";
import { type ConnectorConfig, getConnector } from "@/core/connectors/index.ts";
import type { MaingoRestConnector } from "@/core/connectors/rest.ts";
import {
  type Middleware,
  MiddlewareStack,
  type MiddlewareStackInterface,
} from "@/core/middleware-stack.ts";

export type ClientConfig = ConnectorConfig & {
  /** The authentication method used by the API. */
  auth?: AuthConfig;
  /** The optional search param format configuration. This defaults to "delimited"
   * which is the web standard. The "indexed" format is used by some services, such
   * as those running on PHP. */
  searchParamFormat?: "delimited" | "indexed";
};

export class Client {
  private connector: MaingoRestConnector | MaingoGraphqlConnector;
  private auth: AuthMethods | undefined;
  private middlewareStack = new MiddlewareStack();

  constructor(private readonly config: ClientConfig) {
    this.config.auth ??= { type: "none" };
    this.config.searchParamFormat ??= "delimited";

    this.auth = getAuth(this.config?.auth);
    this.connector = getConnector(this.config, () => this.middleware);
  }

  /** Retrieve the currently active middleware for the client. */
  public middleware: Middleware[] = this.middlewareStack.middleware;

  /**
   * Check if the given name exists in the client middleware stack.
   * @param name
   * @returns
   */
  public hasMiddleware: MiddlewareStackInterface["has"] = this.middlewareStack
    .has.bind(this.middlewareStack);
  /**
   * Retrieve a middleware from the client middleware stack, by name.
   * @param name
   * @returns
   */
  public getMiddleware: MiddlewareStackInterface["get"] = this.middlewareStack
    .get.bind(this.middlewareStack);
  /**
   * Adds middleware to the client middleware stack. The method returns
   * a symbol which can be used to remove the middleware.
   * @param middleware
   * @param name
   */
  public useMiddleware: MiddlewareStackInterface["use"] = this.middlewareStack
    .use.bind(this.middlewareStack);
  /**
   * Removes middleware from the client middleware stack.
   * @param key
   */
  public removeMiddleware: MiddlewareStackInterface["remove"] = this.middlewareStack
    .remove.bind(this.middlewareStack);

  /**
   * Initializes the client by setting up authentication middleware (if available)
   * and delegating the initialization process to the connector.
   * @returns
   */
  public init() {
    const authMiddleware = this.auth?.getAuthentication(this);

    if (authMiddleware) {
      this.middlewareStack.use(authMiddleware, "auth");
    }

    return this.connector.init(this);
  }
}

export function createClient<
  C extends ClientConfig,
  ConnectorType extends "rest" & Extract<C["connector"], "rest">,
>(
  config: C,
): Client & MaingoRestConnector;
export function createClient<
  C extends ClientConfig,
  ConnectorType extends "graphql" & Extract<C["connector"], "graphql">,
>(
  config: C,
): Client & MaingoGraphqlConnector;
export function createClient<C extends ClientConfig>(
  config: C,
): Client {
  return new Client(config).init();
}
