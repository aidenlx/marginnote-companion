import { Editor, EditorChange } from "obsidian";

import { getSelectedRanges } from "../cm-tools";

export const StripChNumPattern =
  /第[一二三四五六七八九十]+?[章节篇]\s*|[一二三四五六七八九十]+?[、，]\s*/g;

const StripChapterNum = (checking: boolean, editor: Editor) => {
  const ranges = getSelectedRanges(editor);
  if (checking) {
    return ranges.some(
      (range) => (
        (StripChNumPattern.lastIndex = 0),
        StripChNumPattern.test(editor.getRange(range.from, range.to))
      ),
    );
  } else {
    editor.transaction({
      changes: ranges.reduce((arr, range) => {
        StripChNumPattern.lastIndex = 0;
        const text = editor.getRange(range.from, range.to);
        if (!StripChNumPattern.test(text)) return arr;
        arr.push({ ...range, text: text.replace(StripChNumPattern, "") });
        return arr;
      }, [] as EditorChange[]),
    });
  }
};

export default StripChapterNum;
