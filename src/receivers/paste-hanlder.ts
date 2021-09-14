import equal from "fast-deep-equal/es6";
import { Command, Notice } from "obsidian";

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
      const target = e.target;
      e.preventDefault();
      await insert(plugin, () =>
        target.dispatchEvent(
          new ClipboardEvent("paste", {
            clipboardData: e.clipboardData,
            cancelable: false,
          }),
        ),
      );
    }
  };

const insert = async (plugin: MNComp, noDataCallback: () => void) => {
  const result = await plugin.mnHandler.insertToNote();
  if (result !== InsertNoteResult.NoMNData) {
    if (result === InsertNoteResult.NoVaildData) {
      new Notice("Unable to paste TOC data from MarginNote directly to note");
    } else if (result <= 0) {
      new Notice(
        "Error while insert data from MarginNote to note, check console for details",
      );
    }
  } else noDataCallback();
};

export const getInsertCommand: (plugin: MNComp) => Command = (plugin) => ({
  id: "mn-insert2doc",
  name: "Insert MarginNote Data to Active Note",
  editorCallback: async (editor, view) => {
    insert(plugin, () => new Notice("No MarginNote data recieved"));
  },
});
