import MNComp from "../mn-main";
import { handleMNData } from "../handlers/handler";
import { NoteImportOption } from "../handlers/handle-note";
import { Editor } from "obsidian";

export const getPastedHandler =
  (plugin: MNComp) => (cm: CodeMirror.Editor, e: ClipboardEvent) => {
    let text = e.clipboardData?.getData("text");
    if (text) {
      let handle = handleMNData(text, cm, plugin.settings.noteImportOption);
      if (handle) e.preventDefault();
    }
  };

export const getCmdPasteHandler =
  (option: NoteImportOption) =>
  async (editor: Editor): Promise<boolean> =>
    handleMNData(await navigator.clipboard.readText(), editor, option);
