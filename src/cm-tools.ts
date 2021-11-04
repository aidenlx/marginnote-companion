import equal from "fast-deep-equal/es6";
import { Editor, EditorPosition, EditorRange } from "obsidian";

export const InsertTo = (
  ...args:
    | [str: string, cm: Editor, pos: EditorPosition]
    | [str: string, cm: Editor, line: number, ch: number]
): void => {
  const [str, cm, posOrLine, ch] = args;
  let pos: EditorPosition;

  if (Number.isInteger(posOrLine) && (Number.isInteger(ch) || ch === Infinity))
    pos = { line: <number>posOrLine, ch: <number>ch };
  else if (isPos(posOrLine)) pos = posOrLine;
  else {
    console.error("posOrLine %o, ch %o", posOrLine, ch);
    throw new TypeError("Invalid Params");
  }

  cm.replaceRange(str, pos, pos);
};

const isPos = (obj: any): obj is EditorPosition => {
  if (obj) {
    const { line, ch } = obj as EditorPosition;
    return Number.isInteger(line) && (Number.isInteger(ch) || ch === Infinity);
  } else return false;
};

export const InsertToCursor = (str: string, cm: Editor, reset = false) => {
  const cursor = cm.getCursor();
  InsertTo(str, cm, cursor);
  if (reset) {
    cm.setCursor(cursor);
  } else if (equal(cm.getCursor(), cursor)) {
    // patch cm6
    const offsetBefore = cm.posToOffset(cursor);
    const posNow = cm.offsetToPos(offsetBefore + str.length);
    cm.setCursor(posNow);
  }
};

/**
 *
 * @param cm
 * @param match
 * @param start
 * @returns -1 if no line matches
 */
export const FindLine = (cm: Editor, match: RegExp, start = 0): number => {
  for (let i = start; i < cm.lineCount(); i++) {
    if (match.test(cm.getLine(i) as string)) return i;
  }
  return -1;
};

export const SetLine = (cm: Editor, lineNum: number, text: string) => {
  cm.replaceRange(
    text,
    { line: lineNum, ch: 0 },
    { line: lineNum, ch: Infinity },
  );
};

export const getStartIndexOfSel = (cm: Editor): number => {
  // @ts-ignore
  const from = cm.getCursor(true);
  // @ts-ignore
  const to = cm.getCursor(false);
  return cm.posToOffset(getAheadPos(from, to));
};

const getAheadPos = (a: EditorPosition, b: EditorPosition) => {
  if (a.line !== b.line) {
    return a.line < b.line ? a : b;
  } else {
    return a.ch < b.ch ? a : b;
  }
};

const sortPos = (a: EditorPosition, b: EditorPosition) => {
  let line = a.line - b.line;
  if (line === 0) return a.ch - b.ch;
  else return line;
};
/**
 * @returns if nothing selected, return active line
 */
export const getSelectedRanges = (editor: Editor): EditorRange[] => {
  const { line } = editor.getCursor();
  if (!editor.somethingSelected()) {
    return [{ from: { ch: 0, line }, to: { ch: Infinity, line } }];
  } else {
    return editor.listSelections().map((sel) => {
      const { anchor, head } = sel,
        [from, to] = [anchor, head].sort(sortPos);
      return { from, to };
    });
  }
};
