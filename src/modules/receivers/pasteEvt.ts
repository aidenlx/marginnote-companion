import MNComp from "main";
import { handleMNData } from "../handlers/handler";

export function PastedNoteHandler(this: MNComp, cm: CodeMirror.Editor, e: ClipboardEvent) {
  let text = e.clipboardData?.getData("text");
  if (text) {
    let handle = handleMNData(text, cm, this.settings.noteImportOption);
    if (handle) e.preventDefault();
  }
};