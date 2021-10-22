import { Book } from "@aidenlx/obsidian-bridge";
import { unescape } from "html-escaper";

export const OBBRIDGE_MIN_VERSION = "3.0.4".replace(/\.\d+$/, ".x");
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

export type filterKeyWithType<O, F> = {
  [K in keyof O]: O[K] extends F ? K : never;
}[keyof O];

export type AddForEachProp<T, A = undefined> = {
  [K in keyof T]: T[K] | A;
};

type NonTypePropNames<T, Target> = {
  [K in NonNullable<keyof T>]: T[K] extends Target ? never : K;
}[NonNullable<keyof T>];
export type NonTypeProps<T, Target> = Pick<T, NonTypePropNames<T, Target>>;

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

export const strToFragment = (str: string) =>
  createFragment((el) =>
    str.split("\n").forEach((line, i, arr) => {
      el.appendText(unescape(line));
      if (i < arr.length - 1) el.createEl("br");
    }),
  );

const isPosInteger = (num: any): num is number =>
  Number.isInteger(num) && num > 0;
/** page info from mn data to page tuple */
export const toPage = (
  toc: Partial<Record<"startPage" | "endPage", number>>,
): [start: number, end: number] | undefined => {
  const { startPage: start, endPage: end } = toc;
  if (isPosInteger(start) && isPosInteger(end)) return [start, end];

  const toExport = start ? start : end;
  if (isPosInteger(toExport)) return [toExport, toExport];
  else return undefined;
};

export const getBookFromMap = (
  md5: string | undefined,
  map: Record<string, Book> | undefined,
) => (md5 && map ? map[md5] : {}) as Partial<Book>;
