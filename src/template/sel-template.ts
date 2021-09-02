import { ReturnBody_Sel } from "@aidenlx/obsidian-bridge";

import { WithUndefined } from "../misc";
import MNComp from "../mn-main";
import { Text } from "./basic";
import Template, { getViewKeys, PHValMap } from "./template";

/** accepted placeholders */
type SelRec = PHValMap<"FilePath" | "DocTitle"> &
  WithUndefined<{ Selection: Text }>;

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
    if (!templates) throw new Error("No template found for key " + tplName);

    const { sel, book } = body.data,
      view: SelRec = {
        Selection: this.getText(sel),
        FilePath: book?.pathFile,
        DocTitle: book?.docTitle,
      };
    return this.renderTemplate(templates.sel, view);
  }
  render(...args: Parameters<SelTemplate["prerender"]>): string {
    return this.prerender(...args);
  }
}
