import { Editor, EditorPosition } from "obsidian";

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

export const InsertToCursor = (str: string, cm: Editor, before = false) => {
  const cursor = cm.getCursor();
  InsertTo(str, cm, cursor);
  if (before) cm.setCursor(cursor);
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
