import { ReturnBody_Sel } from "@aidenlx/obsidian-bridge";

import { WithUndefined } from "../misc";
import MNComp from "../mn-main";
import { Text } from "./basic";
import Template, { PHValMap } from "./template";

/** accepted placeholders */
type SelRec = PHValMap<"FilePath" | "DocTitle"> &
  WithUndefined<{ Selection: Text }>;

export default class SelTemplate extends Template<"selection"> {
  constructor(plugin: MNComp) {
    super(plugin, "selection");
  }
  render(body: ReturnBody_Sel): string {
    const { sel, book } = body.data,
      view: SelRec = {
        Selection: this.getText(sel),
        FilePath: book?.pathFile,
        DocTitle: book?.docTitle,
      };
    return this.renderTemplate(this.template, view);
  }
}
