import equal from "fast-deep-equal/es6";
import { Notice } from "obsidian";

import { InsertNoteResult } from "../handlers/mn-data-handler";
import MNComp from "../mn-main";

export const getPastedHandler =
  (plugin: MNComp) => async (cm: CodeMirror.Editor, e: ClipboardEvent) => {
    if (
      e.cancelable &&
      e.target &&
      // plain text only to avoid breaking html->md
      equal(e.clipboardData?.types, ["text/plain"])
    ) {
      e.preventDefault();
      const result = await plugin.mnHandler.insertToNote();
      if (result !== InsertNoteResult.NoMNData) {
        if (result === InsertNoteResult.NoVaildData) {
          new Notice(
            "Unable to paste TOC data from MarginNote directly to note",
          );
        } else if (result <= 0) {
          new Notice(
            "Error while insert data from MarginNote to note, check console for details",
          );
        }
      } else {
        e.target.dispatchEvent(
          new ClipboardEvent("paste", {
            clipboardData: e.clipboardData,
            cancelable: false,
          }),
        );
      }
    }
  };

// export const getCmdPasteHandler =
//   (option: NoteImportOption) =>
//   async (editor: Editor): Promise<boolean> =>
//     handleMNData(await navigator.clipboard.readText(), editor, option);
