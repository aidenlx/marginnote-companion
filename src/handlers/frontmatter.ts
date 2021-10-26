import matter from "gray-matter";
import { Editor, EditorRange } from "obsidian";

import { FindLine, InsertTo } from "../cm-tools";

export const getFrontmatterRange = (cm: Editor): EditorRange | null => {
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
};

type keyValue = {
  [key: string]: any;
};
export const addToFrontmatter = (
  entry: string,
  items: keyValue | string[],
  cm: Editor,
) => {
  const fmRange = getFrontmatterRange(cm);

  if (fmRange) {
    const { from, to } = fmRange;
    const fmObj = matter(cm.getRange(from, to)).data;
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
    cm.replaceRange(getFrontmatter(fmObj), from, to);
  } else {
    InsertTo(getFrontmatter({ [entry]: items }) + "\n", cm, 0, 0);
  }
};

export const getFrontmatter = (fmObj: { [k: string]: any }) =>
  matter
    .stringify("", fmObj, { flowLevel: 3 } as any)
    .replace(/^\s+|\s+$/g, "");
