import { addToFrontmatter } from "modules/md-tools/frontmatter";
import { MarkdownView, App } from "obsidian";
import { ExtractDef } from "./autodef";

export function SelToAilas(app:App) {
  const view = app.workspace.activeLeaf.view;
  if (!(view instanceof MarkdownView)){
    console.log(`activeLeaf view type ${view.getViewType()}: not markdown`);
    return;
  }
  const editor = view.editor;
  
  const sel = editor.getSelection();

  console.log(ExtractDef(sel))

  addToFrontmatter('aliases',ExtractDef(sel),editor)

  editor.replaceSelection('');
}