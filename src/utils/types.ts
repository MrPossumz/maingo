/** Used to exclude a subset of unions from a larger union. */
export type ExcludeFromUnion<U, T> = T extends U ? never : T;

/** Merges two record types. If a key exists in both types then the value from
 * the latter type is preferentially used. */
export type Assign<A, B> = A extends Record<string | number | symbol, any>
  ? B extends Record<string | number | symbol, any> ? {
      [K in keyof A | keyof B]: K extends keyof A ? K extends keyof B ? B[K] // Merge types if key exists in both
        : A[K] // Otherwise, use type from A
        : K extends keyof B ? B[K]
        : never; // Use type from B
    }
  : never
  : never;
