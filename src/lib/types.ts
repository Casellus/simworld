export type Single<T> = T extends Array<infer U> ? U : T;

export function one<T>(v: T | T[] | null | undefined): Single<T> | null {
  if (!v) return null;
  if (Array.isArray(v)) return (v[0] ?? null) as Single<T> | null;
  return v as Single<T>;
}
