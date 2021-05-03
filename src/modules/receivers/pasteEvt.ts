import { handleMNData } from "../handlers/handler";

export function PastedNoteHandler(cm: CodeMirror.Editor, e: ClipboardEvent) {
  let text = e.clipboardData?.getData("text");
  if (text) {
    let handle = handleMNData(text, cm);
    if (handle) e.preventDefault();
  }
}
