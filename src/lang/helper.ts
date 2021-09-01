import type { i18n } from "i18next";

import en from "./en";
import zh from "./zh";

const resources: Record<"en" | "zh", { default: Dict }> = {
  en: { default: en },
  zh: { default: zh },
};

export default i18next.createInstance(
  {
    lng: localStorage.language,
    fallbackLng: "en",
    ns: ["default"],
    defaultNS: "default",
    interpolation: { escapeValue: true },
    // debug: true,
    resources,
  },
  (err, t) => {
    if (err) return console.log(err);
  },
) as Omit<i18n, "t"> & { t: TFunction };

export type Dict = UnConst<typeof en>;
type DictConst = typeof en;

type UnConst<T extends object> = {
  [K in keyof T]: T[K] extends object ? UnConst<T[K]> : string;
};

// from https://stackoverflow.com/a/58308279

export type TFunction = <
  S extends string,
  ReturnRaw extends GetDictValue<S, DictConst>,
  Return extends ReturnRaw extends string ? ReturnRaw : "",
  I extends Record<Keys<Return>[number], string>,
  ReturnIP extends Interpolate<Return, I>,
>(
  p: DeepKeys<DictConst, S>,
  options?: I,
) => Keys<Return> extends never ? ReturnRaw : ReturnIP;

type GetDictValue<T extends string, O> = T extends `${infer A}.${infer B}`
  ? A extends keyof O
    ? GetDictValue<B, O[A]>
    : never
  : T extends keyof O
  ? O[T]
  : never;

// T is the dictionary, S ist the next string part of the object property path
// If S does not match dict shape, return its next expected properties
type DeepKeys<T, S extends string> = T extends object
  ? S extends `${infer I1}.${infer I2}`
    ? I1 extends keyof T
      ? `${I1}.${DeepKeys<T[I1], I2>}`
      : keyof T & string
    : S extends keyof T
    ? `${S}`
    : keyof T & string
  : "";

// retrieves all variable placeholder names as tuple
type Keys<S extends string> = S extends ""
  ? []
  : S extends `${infer _}{{${infer B}}}${infer C}`
  ? [B, ...Keys<C>]
  : never;

// substitutes placeholder variables with input values
type Interpolate<
  S extends string,
  I extends Record<Keys<S>[number], string>,
> = S extends ""
  ? ""
  : S extends `${infer A}{{${infer B}}}${infer C}`
  ? `${A}${I[Extract<B, keyof I>]}${Interpolate<C, I>}`
  : never;

// Example
// type Dict = { key: "yeah, {{what}} is {{how}}" };
// type KeysDict = Keys<Dict["key"]>; // type KeysDict = ["what", "how"]
// type I1 = Interpolate<Dict["key"], { what: "i18next"; how: "great" }>;
// type I1 = "yeah, i18next is great"

// implementation omitted here
// declare function t<
//   K extends keyof Dict,
//   I extends Record<Keys<Dict[K]>[number], string>,
// >(k: K, args: I): Interpolate<Dict[K], I>;
