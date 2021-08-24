import { ObsidianProtocolData } from "obsidian";
import MNComp from "mn-main";
import { SelToAilas } from "./SelToAilas";

export default function MacroHandler(this: MNComp, params: ObsidianProtocolData): void {
  const macroName = params.macro;
  if (!macroName)
    throw new TypeError("Params without macro field is passed to MacroHandler");

  switch (macroName) {
    case "autodef":
      SelToAilas(this.app);
      break;
    default:
      console.error("unsupported macro");
      break;
  }
}
