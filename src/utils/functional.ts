/**
 * Pipe: Executes functions from left to right.
 * Takes a list of functions and returns a new function that applies them in sequence.
 * @param {...Array<(arg: T) => T>} fns - Functions to be executed in order.
 * @returns {(arg: T) => T} A function that applies the provided functions in sequence.
 * @example
 * const add = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const result = pipe(add, double)(2); // result: 6
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduce((result, fn) => fn(result), arg);
}

/**
 * Curry: Transforms a function into a curried version.
 * Converts a function that takes multiple arguments into a sequence of functions, each taking a single argument.
 * Supports functions with an arbitrary number of arguments.
 * @param {function} fn - The function to be curried.
 * @returns {function} A curried version of the input function.
 * @example
 * const add = (a: number, b: number, c: number) => a + b + c;
 * const curriedAdd = curry(add);
 * const addFive = curriedAdd(5);
 * const addFiveAndThree = addFive(3);
 * const result = addFiveAndThree(2); // result: 10
 */
export function curry<T extends any[], R>(fn: (...args: T) => R): (...args: Partial<T>) => any {
  return function curried(...args: Partial<T>): any {
    if (args.length >= fn.length) {
      return fn(...(args as T));
    }
    return (...nextArgs: Partial<T>) => curried(...([...args, ...nextArgs] as T));
  };
}

/**
 * Compose: Executes functions from right to left.
 * Takes a list of functions and returns a new function that applies them in reverse order.
 * @param {...Array<(arg: T) => T>} fns - Functions to be executed in reverse order.
 * @returns {(arg: T) => T} A function that applies the provided functions in reverse sequence.
 * @example
 * const add = (x: number) => x + 1;
 * const double = (x: number) => x * 2;
 * const result = compose(double, add)(2); // result: 6
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((result, fn) => fn(result), arg);
}

/**
 * Identity: Returns the input value unchanged.
 * Useful as a default or placeholder function.
 * @param {T} arg - The input value.
 * @returns {T} The same input value.
 * @example
 * const result = identity(5); // result: 5
 */
export function identity<T>(arg: T): T {
  return arg;
}
