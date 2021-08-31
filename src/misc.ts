export const OBBRIDGE_MIN_VERSION = "2.4.0";

export const trimEmpty = (str: string) => str.replace(/^\s+|\s+$/g, "");

export const ChsRegex = /[\u4e00-\u9fa5]/g;

// Range as Number type <https://github.com/microsoft/TypeScript/issues/15480>
type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never;
type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A;
  1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A["length"] ? 0 : 1];
export type Enumerate<N extends number> = EnumerateInternal<
  [],
  N
> extends (infer E)[]
  ? E
  : never;
export type Range<FROM extends number, TO extends number> = Exclude<
  Enumerate<TO>,
  Enumerate<FROM>
>;

export type WithUndefined<T> = {
  [K in keyof T]: T[K] | undefined;
};

export const findLast = <T>(
  array: Array<T> | undefined,
  predicate: (value: T, index: number, obj: T[]) => boolean,
): T | null => {
  if (!array) return null;
  let l = array.length;
  while (l--) {
    if (predicate(array[l], l, array)) return array[l];
  }
  return null;
};
