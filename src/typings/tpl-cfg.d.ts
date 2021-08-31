interface TemplateCfg<T extends string> {
  templates: Record<T, string>;
  pin: boolean;
}
interface KeyTplParamsMap {
  sel: "sel";
  note: "body" | "comment" | "cmt_linked";
  toc: "item";
}
interface KeyExtParamsMap {
  sel: {};
  note: {};
  toc: {};
}

export type TplKeys = keyof KeyTplParamsMap;
type TplRec<K extends TplKeys> = TemplateCfg<KeyTplParamsMap[K]> &
  KeyExtParamsMap[K];
type toExport<K extends TplKeys> = {
  src: {
    [Key in K]: Map<string, TplRec<K>>;
  };
  json: {
    [Key in K]: Record<string, TplRec<K>>;
  };
};

export type TplParam<K extends TplKeys> = Record<KeyTplParamsMap[K], string>;
export type ExtParam<K extends TplKeys> = KeyExtParamsMap[K] &
  Omit<TemplateCfg<string>, "templates">;
export type TemplateSettings = toExport<"sel"> &
  toExport<"note"> &
  toExport<"toc">;
