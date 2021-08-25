export const mnUrl = (type: "notebook" | "note", id: string) =>
  `marginnote3app://${type}/` + id;
export const OBBRIDGE_MIN_VERSION = "2.3.2";

export const trimEmpty = (str: string) => str.replace(/^\s+|\s+$/g, "");

export const textProcess = (src: string) =>
  src
    .replace(/ {2,}/g, " ")
    .replace(/(\d+?\.(?![\d]).+?) +?/g, "$1：")
    .replace(/^[;,. ]+|[;,. ]+$|\B | \B/g, "")
    .replace(/;/g, "；")
    .replace(/,/g, "，")
    .replace(/([A-Za-z0-9])\s{0,}，\s{0,}(?=[A-Za-z0-9])/g, "$1,")
    .replace(/:/g, "：")
    .replace(/〜/g, "~")
    .replace(/[“”„‟〝〞〟＂]/g, '"');

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
