import { EditorPosition, Editor } from "obsidian";

export function InsertTo(
  str: string,
  cm: CodeMirror.Editor | Editor,
  pos: EditorPosition
): void;
export function InsertTo(
  str: string,
  cm: CodeMirror.Editor | Editor,
  line: number,
  ch: number
): void;
export function InsertTo(
  str: string,
  cm: CodeMirror.Editor | Editor,
  posOrLine: EditorPosition | number,
  ch?: number
): void {
  let pos: EditorPosition;

  if (Number.isInteger(posOrLine) && (Number.isInteger(ch) || ch === Infinity))
    pos = { line: <number>posOrLine, ch: <number>ch };
  else if (isPos(posOrLine)) pos = posOrLine;
  else {
    console.error("posOrLine %o, ch %o", posOrLine, ch);
    throw new TypeError("Invalid Params");
  }

  cm.replaceRange(str, pos, pos);
}

function isPos(obj: any): obj is EditorPosition {
  if (obj) {
    const { line, ch } = obj as EditorPosition;
    return Number.isInteger(line) && (Number.isInteger(ch) || ch === Infinity);
  } else return false;
}

export const InsertToCursor = (str: string, cm: CodeMirror.Editor | Editor) =>
  InsertTo(str, cm, cm.getCursor());

/**
 *
 * @param cm
 * @param match
 * @param start
 * @returns -1 if no line matches
 */
export function FindLine(
  cm: CodeMirror.Editor | Editor,
  match: RegExp,
  start = 0
): number {
  for (let i = start; i < cm.lineCount(); i++) {
    if (match.test(cm.getLine(i) as string)) return i;
  }
  return -1;
}

export function SetLine(
  cm: CodeMirror.Editor | Editor,
  lineNum: number,
  text: string
) {
  cm.replaceRange(
    text,
    { line: lineNum, ch: 0 },
    { line: lineNum, ch: Infinity }
  );
}

export function getStartIndexOfSel(cm: CodeMirror.Editor): number {
  // @ts-ignore
  const from = cm.getCursor(true);
  // @ts-ignore
  const to = cm.getCursor(false);
  return cm.indexFromPos(getAheadPos(from, to));
}

function getAheadPos(a: CodeMirror.Position, b: CodeMirror.Position) {
  if (a.line !== b.line) {
    return a.line < b.line ? a : b;
  } else {
    return a.ch < b.ch ? a : b;
  }
}
