import { Editor, EditorChange } from "obsidian";

import MNComp from "../mn-main";
import { getLinePos } from "./basic";
import { getIndentLevel, matchEntry } from "./utils";

type EntryInfo = NonNullable<ReturnType<typeof matchEntry>>;

const toc2head = (whole: boolean) => (checking: boolean, editor: Editor) => {
  const { line: cursorLineNum } = editor.getCursor(),
    matchResult = matchEntry(editor, cursorLineNum);
  if (checking) {
    return !!matchResult;
  } else if (matchResult) {
    let changes: EditorChange[] = [];
    const br = "%%LB%%";
    const handleResult = (result: EntryInfo, toHeading: boolean) => {
      const { replaceLine, replacePrefix } = result;
      if (toHeading)
        changes.push(
          replaceLine((prefix, desc, links) =>
            `${"#".repeat(
              getIndentLevel(prefix) + 1,
            )} ${desc}\n\n${links}\n`.replace(/\n/g, br),
          ),
        );
      else changes.push(replacePrefix((prefix) => prefix.replace(/^\s+/g, "")));
    };

    const { prefix: refPrefix } = matchResult;
    handleResult(matchResult, true);
    let from = cursorLineNum,
      to = cursorLineNum;
    let result;
    while ((result = matchEntry(editor, from - 1))) {
      const { prefix } = result;
      handleResult(result, whole || prefix.length <= refPrefix.length);
      from--;
    }
    while ((result = matchEntry(editor, to + 1))) {
      const { prefix } = result;
      handleResult(result, whole || prefix.length <= refPrefix.length);
      to++;
    }
    editor.transaction({ changes });
    const listRange = [getLinePos(from, true), getLinePos(to, false)] as const;
    editor.replaceRange(
      editor.getRange(...listRange).replace(new RegExp(br, "g"), "\n"),
      ...listRange,
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
