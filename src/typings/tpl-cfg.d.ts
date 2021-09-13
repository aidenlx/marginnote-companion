import { DataType } from "@aidenlx/obsidian-bridge";

export type TplCfgTypes = DataType;

export type Templates<K extends TplCfgTypes> = Record<
  TypeTplParamsMap[K],
  TplValue
>;
interface TemplateCfg<K extends TplCfgTypes> {
  templates: Templates<K>;
  pin: boolean;
}
interface TypeTplParamsMap {
  sel: "sel";
  note: "body" | "comment" | "cmt_linked";
  toc: "item";
}

export type TplValue = string;

interface TypeExtParamsMap {
  sel: {};
  note: {};
  toc: {
    /** true: use tab/space based on setting, false: no indent */
    indentChar: string | true;
  };
}
export type ExtParams<K extends TplCfgTypes> = TypeExtParamsMap[K] &
  Omit<TemplateCfg<K>, "templates">;

export type TplCfgRec<K extends TplCfgTypes> = TemplateCfg<K> &
  TypeExtParamsMap[K];
export type TplCfgRecs =
  | TplCfgRec<"toc">
  | TplCfgRec<"sel">
  | TplCfgRec<"note">;
type toExport<K extends TplCfgTypes> = {
  src: {
    [Key in K]: { cfgs: Map<string, TplCfgRec<K>> };
  };
  json: {
    [Key in K]: { cfgs: Record<string, TplCfgRec<K>> };
  };
};

type TemplateSettings = toExport<"sel"> & toExport<"note"> & toExport<"toc">;
export default TemplateSettings;
