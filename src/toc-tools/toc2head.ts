import { Editor, EditorRange } from "obsidian";

import MNComp from "../mn-main";
import { entry2Heading, test } from "./utils";

const toc2head = (whole: boolean) => (checking: boolean, editor: Editor) => {
  const { line: cursorLineNum } = editor.getCursor(),
    activeLine = editor.getLine(cursorLineNum);
  if (checking) {
    return test(activeLine);
  } else {
    let range: EditorRange = {
      from: { line: cursorLineNum, ch: 0 },
      to: { line: cursorLineNum, ch: Infinity },
    };
    while (test(editor.getLine(range.from.line - 1))) {
      range.from.line--;
    }
    while (test(editor.getLine(range.to.line + 1))) {
      range.to.line++;
    }
    editor.setSelection(range.from, range.to);
    editor.replaceSelection(
      entry2Heading(
        editor.getSelection(),
        whole ? undefined : activeLine,
      ).replace(/\n{3,}/g, "\n\n"),
    );
  }
};

const Toc2Heading = (plugin: MNComp) => {
  plugin.addCommand({
    id: "toclist2head",
    name: "Toc List to Headings",
    editorCheckCallback: toc2head(true),
  });
  plugin.addCommand({
    id: "tocitem2head",
    name: "Toc Items to Headings (level above active line)",
    editorCheckCallback: toc2head(false),
  });
};

export default Toc2Heading;
