import { handleMNData } from "../handlers/handler";

export function handlePastedNote(cm: CodeMirror.Editor) {
  cm.on("paste", (cm, e) => {
    let text = e.clipboardData?.getData("text");
    if (text) {
      let handle = handleMNData(text, cm);
      if (handle) e.preventDefault();
    }
  });
}
