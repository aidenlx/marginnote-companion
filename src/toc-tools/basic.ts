import { Content, Link, Parent } from "mdast";
import { Editor, EditorPosition, EditorRange } from "obsidian";
import { Point, Position } from "unist";
import { pointEnd, pointStart } from "unist-util-position";

const get1stChildWithType = <T extends Content["type"]>(
  p: Parent | null,
  type: T,
): Extract<Content, { type: T }> | null => {
  const firstChild = p?.children.first();
  if (firstChild && firstChild.type === type) return firstChild as any;
  else return null;
};
export const getFisrtOf = <T extends Content["type"]>(
  root: Parent | null,
  ...types: [...Content["type"][], T]
): Extract<Content, { type: T }> | null => {
  if (!root) return null;
  let next = root;
  for (let i = 0; i < types.length; i++) {
    const result = get1stChildWithType(next, types[i]);
    if (
      !result ||
      (i < types.length - 1 && // if the last, skip Parent check
        !(result as Parent).children)
    )
      return null;
    next = result as Parent;
    result.position;
  }
  return next as any;
};

/**
 * Unist Point To Ob's EditorPosition
 */
export const UPointToObPos = (
  point: Point,
  line = 0,
  ch = 0,
): EditorPosition => ({
  line: point.line - 1 + line,
  ch: point.column - 1 + ch,
});

export const getLinePos = (
  line: number,
  chOrStart: boolean | number = true,
): EditorPosition =>
  typeof chOrStart === "boolean"
    ? { line, ch: chOrStart ? 0 : Infinity }
    : { line, ch: chOrStart };

/**
 * Unist Position To Ob's EditorRange
 */
export const UPosToObRange = (
  pos: Position,
  start: EditorPosition = { line: 0, ch: 0 },
): EditorRange => ({
  from: UPointToObPos(pos.start, start.line, start.ch),
  to: UPointToObPos(pos.end, start.line, start.ch),
});

export type LinkWithLT = Link & { linktext: string };

export const getSection = (editor: Editor, from: number, to?: number) =>
  editor.getRange({ ch: 0, line: from }, { ch: Infinity, line: to ?? from });

export const fetchTextForChildren = (str: string, children: Content[]) => {
  const start = pointStart(children.first()).offset,
    end = pointEnd(children.last()).offset as number;
  if (start !== undefined && end !== undefined)
    return str.substring(start, end);
  else {
    console.error(children);
    throw new TypeError("Missing offset in pos");
  }
};
