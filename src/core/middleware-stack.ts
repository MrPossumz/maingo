import type { MaingoRequest, MaingoResponse } from "@/types.ts";
import type { ConnectorCall } from "@/core/connectors/base.ts";

/**
 * Represents a middleware function in the request/response lifecycle.
 *
 * A middleware function processes a request (`MaingoRequest`) and either
 * passes it to the next middleware in the stack by invoking `next`, or
 * returns a response (`MaingoResponse`) directly.
 *
 * @param req - The incoming request object of type `MaingoRequest`.
 * @param next - A function to call the next middleware in the stack, which
 *               returns a `Promise` resolving to a `MaingoResponse`.
 * @returns A `Promise` that resolves to a `MaingoResponse` after processing
 *          the request.
 */
export type Middleware = (req: MaingoRequest, next: ConnectorCall) => Promise<MaingoResponse>;

/**
 * Interface representing a stack of middleware functions.
 */
export interface MiddlewareStackInterface {
  /**
   * Array of middleware functions in the stack.
   */
  middleware: Middleware[];

  /**
   * Checks if a middleware with the given name or symbol exists in the stack.
   *
   * @param name - The name or symbol of the middleware to check.
   * @returns `true` if the middleware exists, otherwise `false`.
   */
  has: (name: string | Symbol) => boolean;

  /**
   * Retrieves a middleware by its name or symbol.
   *
   * @param name - The name or symbol of the middleware to retrieve.
   * @returns The middleware if found, otherwise `undefined`.
   */
  get: (name: string | Symbol) => Middleware | undefined;

  /**
   * Adds a middleware to the stack.
   *
   * @param middleware - The middleware function to add.
   * @param name - Optional name for the middleware.
   * @returns A unique symbol representing the middleware.
   */
  use: <K extends string | Symbol>(middleware: Middleware, name?: K) => K;

  /**
   * Removes a middleware from the stack by its name or symbol.
   *
   * @param key - The name or symbol of the middleware to remove.
   * @returns `true` if the middleware was removed, otherwise `false`.
   */
  remove: (key: string | Symbol) => boolean;
}

/**
 * Represents a stack of middleware functions that can be used to process
 * requests and responses in a client. The stack allows adding, retrieving,
 * checking, and removing middleware by name or symbol.
 */
export class MiddlewareStack implements MiddlewareStackInterface {
  #middleware: Map<string | Symbol, Middleware> = new Map();

  constructor() {}

  get middleware() {
    return Array.from(this.#middleware.values());
  }

  /**
   * Check if the given name exists in the middleware stack.
   * @param name
   * @returns
   */
  has(name: string | Symbol) {
    return this.#middleware.has(name);
  }

  /**
   * Retrieve a middleware from the stack, by name.
   * @param name
   * @returns
   */
  get(name: string | Symbol) {
    return this.#middleware.get(name);
  }

  /**
   * Adds middleware to the client middleware stack. The method returns
   * a symbol which can be used to remove the middleware later.
   * @param middleware
   * @param name
   */
  use<K extends string | Symbol>(middleware: Middleware, name?: K) {
    const key = name ?? `maingo-middleware-key-${this.#middleware.size.toString()}`;

    this.#middleware.set(key, middleware);

    return key as K;
  }

  /**
   * Removes middleware from the stack.
   * @param key
   */
  remove(key: string | Symbol): boolean {
    return this.#middleware.delete(key);
  }
}
