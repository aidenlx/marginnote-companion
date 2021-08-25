import { ReturnBody_Sel } from "@aidenlx/obsidian-bridge";
import { Editor } from "obsidian";

import { InsertToCursor } from "../cm-tools";
import { textProcess } from "../misc";

const handleSel = (
  obj: ReturnBody_Sel,
  cm: CodeMirror.Editor | Editor,
): boolean => {
  const { sel } = obj.data;

  InsertToCursor(textProcess(sel), cm);
  return true;
};

export default handleSel;
