import { DataType } from "@aidenlx/obsidian-bridge";

interface TemplateCfg<T extends string> {
  templates: Record<T, TplValue>;
  pin: boolean;
}
interface TypeTplParamsMap {
  sel: "sel";
  note: "body" | "comment" | "cmt_linked";
  toc: "item";
}
export type TplParam<K extends TplCfgTypes> = Record<
  TypeTplParamsMap[K],
  TplValue
>;
export type TplValue = string;

interface TypeExtParamsMap {
  sel: {};
  note: {};
  toc: {};
}
export type ExtParams<K extends TplCfgTypes> = TypeExtParamsMap[K] &
  Omit<TemplateCfg<string>, "templates">;

export type TplCfgTypes = DataType;
type TplCfgRec<K extends TplCfgTypes> = TemplateCfg<TypeTplParamsMap[K]> &
  TypeExtParamsMap[K];
export type TplCfgRecs =
  | TplCfgRec<"toc">
  | TplCfgRec<"sel">
  | TplCfgRec<"note">;
type toExport<K extends TplCfgTypes> = {
  src: {
    [Key in K]: Map<string, TplCfgRec<K>>;
  };
  json: {
    [Key in K]: Record<string, TplCfgRec<K>>;
  };
};

type TemplateSettings = toExport<"sel"> & toExport<"note"> & toExport<"toc">;
export default TemplateSettings;
