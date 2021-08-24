import { ReturnBody_Sel } from "@aidenlx/obsidian-bridge";
import { textProcess } from "modules/misc";
import { InsertToCursor } from "modules/cm-tools";
import { Editor } from "obsidian";

const handleSel = (
  obj: ReturnBody_Sel,
  cm: CodeMirror.Editor | Editor,
): boolean => {
  const { sel } = obj.data;

  InsertToCursor(textProcess(sel), cm);
  return true;
};

export default handleSel;
