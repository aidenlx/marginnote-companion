/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { MarkdownView, ObsidianProtocolData } from "obsidian";

import MNComp from "../mn-main";
import SelToAilas from "./sel-to-ailas";

export function MacroHandler(this: MNComp, params: ObsidianProtocolData): void {
  const macroName = params.macro;
  if (!macroName)
    throw new TypeError("Params without macro field is passed to MacroHandler");

  switch (macroName) {
    case "autodef": {
      let mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (mdView) SelToAilas(this)(false, mdView.editor);
      break;
    }
    default:
      console.error("unsupported macro");
      break;
  }
}

export function registerMacroCmd(this: MNComp) {
  // register macros
  this.addCommand({
    id: "autodef",
    name: "AutoDef",
    editorCheckCallback: SelToAilas(this),
  });
}
