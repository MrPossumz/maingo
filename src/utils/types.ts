/** Used to exclude a subset of unions from a larger union. */
export type ExcludeFromUnion<U, T> = T extends U ? never : T;
