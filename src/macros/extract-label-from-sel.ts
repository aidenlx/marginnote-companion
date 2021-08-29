import marked from "marked";
import { Editor } from "obsidian";

import { getStartIndexOfSel, offsetToPos } from "../cm-tools";
import { addToFrontmatter } from "../handlers/frontmatter";

const Pos = (line: number, ch: number) => ({ line, ch });

/**
 *
 * @param cm
 * @param label
 * @returns the url of label
 */
const extractSource = (
  cm: CodeMirror.Editor | Editor,
  label: string,
): string | null => {
  let output: string | null = null;
  for (let i = cm.lineCount() - 1; i >= 0; i--) {
    const line = cm.getLine(i) as string;
    if (line.startsWith(`[${label}]:`)) {
      const tokens = marked.lexer(line);
      if (!(output = tokens.links[label.toLowerCase()]?.href))
        throw new TypeError(`invalid refSource: ${line}`);
      else {
        cm.replaceRange("", Pos(i, 0), Pos(i + 1, 0));
      }
    }
  }
  return output;
};

const extractLabelFromSel = (cm: CodeMirror.Editor | Editor) => {
  const sel = cm.getSelection();
  const start = getStartIndexOfSel(cm);

  let matches;
  if ((matches = sel.matchAll(/\[(?<linktext>[\S ]*?)\]\[(?<label>\w+?)\]/g))) {
    console.log(matches);
    let hrefs: { [linktext: string]: string } = {};
    for (const m of [...matches].reverse()) {
      if (!m.groups || (m.index !== 0 && !m.index)) {
        console.error(m);
        throw new Error("group empty");
      }
      const { linktext, label } = m.groups;

      // remove ref
      const replaceFrom = offsetToPos(start + m.index, cm);
      const replaceTo = offsetToPos(start + m.index + m[0].length, cm);
      cm.replaceRange("", replaceFrom, replaceTo);

      // insert to frontmatter
      hrefs[linktext] = extractSource(cm, label) ?? "";
    }
    console.log(hrefs);
    addToFrontmatter("sources", hrefs, cm);
  }
};

export default extractLabelFromSel;
