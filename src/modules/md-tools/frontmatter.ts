import matter from "gray-matter";
import { Editor, EditorRange } from "obsidian";
import { FindLine, InsertTo } from "../cm-tools";

export function getFrontmatterRange(
  cm: CodeMirror.Editor | Editor
): EditorRange | null {
  if (cm.getLine(0) !== "---") return null;
  else {
    let endLineNum;
    if ((endLineNum = FindLine(cm, /^---$/, 1)) !== -1) {
      return {
        from: { line: 0, ch: 0 },
        to: { line: endLineNum, ch: Infinity },
      };
    } else return null;
  }
}

type keyValue = {
  [key: string]: string | string[];
};
export function addToFrontmatter(
  entry: string,
  items: keyValue | string[],
  cm: CodeMirror.Editor | Editor
) {
  const fmRange = getFrontmatterRange(cm);
  let fmStr: string;
  if (fmRange) {
    const { from, to } = fmRange;
    fmStr = cm.getRange(from, to);
    let fmObj = matter(fmStr).data;
    if (fmObj[entry]) {
      if (Array.isArray(fmObj[entry]) && Array.isArray(items)) {
        (fmObj[entry] as string[]).push(...items);
        fmObj[entry] = [...new Set(fmObj[entry])]; // 去重复
      } else if (!Array.isArray(fmObj[entry]) && !Array.isArray(items)) {
        fmObj[entry] = { ...fmObj[entry], ...items };
      } else {
        fmObj[entry] = items;
      }
    } else {
      fmObj[entry] = items;
    }
    fmStr = matter.stringify("", fmObj).replace(/^\s+|\s+$/g, "");
    cm.replaceRange(fmStr, from, to);
  } else {
    fmStr = matter
      .stringify("", {
        [entry]: items,
      })
      .replace(/^\s+|\s+$/g, "");
    InsertTo(fmStr, cm, 0, 0);
  }
}
