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

/** Creates a discriminated union by accepting a record of keys and record values.
 * The key is used to discriminate the union and defaults to "type". */
export type DiscriminatedUnion<T extends {}, P extends string = "type"> = {
  [K in keyof T]: {
    [L in keyof T[K] | P]: L extends keyof T[K] ? T[K][L]
      : L extends P ? K
      : never;
  };
}[keyof T];
