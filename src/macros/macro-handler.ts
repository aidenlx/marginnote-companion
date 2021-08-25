import { ObsidianProtocolData } from "obsidian";
import MNComp from "../mn-main";
import SelToAilas from "./SelToAilas";
import extractLabelFromSel from "./extractLabelFromSel";

export function MacroHandler(this: MNComp, params: ObsidianProtocolData): void {
  const macroName = params.macro;
  if (!macroName)
    throw new TypeError("Params without macro field is passed to MacroHandler");

  switch (macroName) {
    case "autodef":
      // SelToAilas(this.app);
      break;
    default:
      console.error("unsupported macro");
      break;
  }
}

export function registerMacroCmd(this: MNComp) {
  // register macros
  this.addCommand({
    id: "autodef",
    name: "Selection to Ailases",
    editorCallback: SelToAilas,
  });
  this.addCommand({
    id: "extractLabelFromSel",
    name: "Extract Label From Selection",
    editorCallback: extractLabelFromSel,
  });
}
