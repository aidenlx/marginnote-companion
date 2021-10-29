import assertNever from "assert-never";
import { Editor } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import { ExtractDef } from "./autodef";

const SelToAilas =
  (plugin: MNComp) =>
  (checking: boolean, editor: Editor): boolean | void => {
    let sel;
    if (checking) {
      return (
        editor.somethingSelected() || !!plugin.inputListener.isDataAvailable()
      );
    } else if ((sel = editor.getSelection())) {
      addToFrontmatter("aliases", ExtractDef(sel), editor);
      editor.replaceSelection("");
    } else {
      plugin.inputListener
        .readFromInput()
        .then((body) => {
          if (!body) return;
          let text: string | undefined;
          switch (body.type) {
            case "note":
              text = body.data.excerptText;
              break;
            case "sel":
              text = body.data.sel;
              break;
            case "toc":
              text = body.data.excerptText || body.data.noteTitle;
              break;
            default:
              assertNever(body);
          }
          if (!text) return;
          addToFrontmatter("aliases", ExtractDef(text), editor);
        })
        .catch((err) => console.error(err));
    }
  };

export default SelToAilas;
