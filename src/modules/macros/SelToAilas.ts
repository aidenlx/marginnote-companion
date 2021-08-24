import { addToFrontmatter } from "modules/md-tools/frontmatter";
import { Editor } from "obsidian";
import { ExtractDef } from "./autodef";

let sel;
const SelToAilas = (editor: Editor) => {
  if ((sel = editor.getSelection())) {
    addToFrontmatter("aliases", ExtractDef(sel), editor);
    editor.replaceSelection("");
  }
};

export default SelToAilas;
