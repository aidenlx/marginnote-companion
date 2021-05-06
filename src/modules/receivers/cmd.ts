import MNComp from "main";
import { NoteImportOption } from "modules/handlers/handleNote";
import { handleMNData } from "modules/handlers/handler";
import { MarkdownView } from "obsidian";

export async function cmdPastedNoteHandler(plugin: MNComp, option: NoteImportOption): Promise<boolean> {
  const view = plugin.app.workspace.activeLeaf.view;
  if (!(view instanceof MarkdownView)) return false;

  const cbText = await navigator.clipboard.readText();

  return handleMNData(cbText, view.editor, option);
}