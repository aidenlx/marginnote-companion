import { handleMNData } from "../handlers/handler";

export function handlePastedNote(cm: CodeMirror.Editor) {
  cm.on("paste", (cm, e) => {
    let text = e.clipboardData?.getData("text");
    if (text) {
      e.preventDefault();
      handleMNData(text, cm);
    }
  });
}
