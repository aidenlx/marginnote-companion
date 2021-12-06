const cleanText = (src: string) => {
  return src
    .trim() // 去除条目开头与结尾的多余空格
    .replace(/ {2,}/g, " ") // 多余空格处理
    .replace(/\B | \B/g, "") // 去除中文内空格和英文单词旁(非单词间)空格
    .replace(/([A-Z])\s*-\s*(?=[A-Z])/gi, ""); // 英文连字符处理
};

const ExtractDef = (raw: string): string[] => {
  raw = cleanText(raw);
  raw = raw.replace(/[.?!+·"。，？！—“”:：；;'<>]/g, "");

  return raw
    .split(/[,、()（）\/【】「」《》«»]+|或者?|[简又也]?称(之?为)?/g)
    .filter((e) => e);
};

import assertNever from "assert-never";
import { Editor, MarkdownView } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";

const SelToAilas =
  (plugin: MNComp) => async (editor: Editor, view: MarkdownView) => {
    const FromSelection = () => {
        const sel = editor.getSelection();
        return sel ? sel : null;
      },
      FromMN = async () => {
        const body = await plugin.inputListener.readFromInput();
        if (!body) return undefined;
        switch (body.type) {
          case "note":
            return body.data.excerptText;
          case "sel":
            return body.data.sel;
          case "toc":
            return body.data.excerptText || body.data.noteTitle;
          default:
            assertNever(body);
        }
      },
      FromClipboard = async () => {
        const text = await navigator.clipboard.readText();
        return text ? text : undefined;
      };
    const text = FromSelection() ?? (await FromMN()) ?? (await FromClipboard());
    if (!text) return;
    addToFrontmatter(
      "aliases",
      ExtractDef(text).filter((str) => str !== view.file.basename),
      editor,
    );
    editor.replaceSelection("");
  };

export default SelToAilas;
