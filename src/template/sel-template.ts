import { ReturnBody_Sel } from "@aidenlx/obsidian-bridge";

import { AddForEachProp } from "../misc";
import MNComp from "../mn-main";
import Text from "./basic/text";
import Template, { getViewKeys, PHValMap } from "./template";

/** accepted placeholders */
type SelRec = PHValMap<"FilePath" | "DocTitle"> &
  AddForEachProp<{ Selection: Text }>;

export const SelViewKeys = getViewKeys<keyof SelRec>({
  FilePath: null,
  DocTitle: null,
  Selection: null,
});

export default class SelTemplate extends Template<"sel"> {
  constructor(plugin: MNComp) {
    super(plugin, "sel");
  }
  prerender(body: ReturnBody_Sel, tplName: string): string {
    const templates = this.getTemplate(tplName);

    const { sel, book } = body.data,
      view: SelRec = {
        Selection: this.getText(sel),
        FilePath: book?.pathFile,
        DocTitle: book?.docTitle,
      };
    try {
      return this.renderTemplate(templates.sel, view);
    } catch (error) {
      throw this.RenderError(error, tplName);
    }
  }
  render(...args: Parameters<SelTemplate["prerender"]>): string {
    return this.prerender(...args);
  }
}
