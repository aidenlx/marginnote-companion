import { Note } from "@aidenlx/obsidian-bridge";
import {
  linkComment,
  linkComment_pic,
  noteComment,
} from "@alx-plugins/marginnote";
import assertNever from "assert-never";

import { MDLink } from "../md-tools/md-link";
import { mnUrl, Range } from "../misc";
import { mdObj } from "../note/render";
import { getSimpleNote } from "./simple-note";

/** title link separator */
export const tlSeparator = /[;；]/;

/** determine if link comment is a picture */
const isLC_pic = (lc: linkComment): lc is linkComment_pic =>
  (lc as linkComment_pic).q_hpic !== undefined;

export const TitlelinkToAlias = (
  srcTitle: string,
): {
  title: string;
  aliases: string[] | null;
} => {
  if (!tlSeparator.test(srcTitle)) return { title: srcTitle, aliases: null };
  else {
    const [title, ...aliases] = srcTitle.replace(/,/g, "_").split(tlSeparator);
    return { title, aliases };
  }
};

/**
 *
 * @param full true to export html and linknote
 * @returns
 */
export const transformComments = (
  comments: noteComment[],
  full: boolean = false,
): mdObj[] | null => {
  if (!comments || comments.length === 0) {
    return null;
  } else {
    const out: mdObj[] = new Array();
    for (const c of comments) {
      switch (c.type) {
        case "TextNote":
          out.push({ p: c.text });
          break;
        case "HtmlNote":
          if (full) {
            out.push({ comment: c.text });
            out.push({ html: c.html });
          } else out.push({ p: c.text });
          break;
        case "LinkNote":
          if (full) {
            out.push({ comment: mnUrl("note", c.noteid) });
            if (isLC_pic(c)) out.push({ comment: "PaintNote" });
          }
          if (c.q_htext) out.push({ p: c.q_htext });
          break;
        case "PaintNote":
          if (!full) break;
          out.push({ comment: "PaintNote" });
          break;
        default:
          assertNever(c);
      }
      out.push({ hr: "" });
    }
    out.pop();
    return out;
  }
};

export const transformMNLink = (
  type: "notebook" | "note",
  id: string,
  linktext?: string,
): MDLink => {
  return new MDLink(mnUrl(type, id), linktext, undefined, id.slice(-6));
};

/**
 *
 * @param str heading content
 * @param level range between 1 - 6
 * @returns a heading obj
 */
export const transformTitle = (str: string, level: Range<1, 7> = 2): mdObj => {
  if (Number.isInteger(level) && level >= 1 && level <= 6) {
    const headingType = "h" + level;
    return { [headingType]: str };
  } else throw new TypeError(`level ${level} invalid`);
};

/**
 * recieve all params and return a merged json2md.DataObject array
 * @param objs string is consider to be "p"
 * @returns
 */
export const toMDObjs = (
  ...params: Array<string | mdObj[] | mdObj | null | undefined>
): mdObj[] => {
  const getPara = (obj: string | mdObj): string[] | null => {
      if (typeof obj === "string") return [obj];
      else if (obj.p) return typeof obj.p === "string" ? [obj.p] : obj.p;
      else return null;
    },
    accPush = (cur: string | mdObj, acc: mdObj[]) => {
      if (typeof cur === "string") acc.push({ p: cur });
      else acc.push(cur);
    },
    reducer = (acc: mdObj[], cur: typeof objs[0], i: number): mdObj[] => {
      if (cur) {
        if (acc.length > 0) {
          const lastIndex = acc.length - 1;
          const last = acc[lastIndex];
          const curPara = getPara(cur);
          if (last.p && curPara) {
            if (typeof last.p === "string") last.p = [last.p, ...curPara];
            else last.p.push(...curPara);
          } else {
            accPush(cur, acc);
          }
        } else {
          accPush(cur, acc);
        }
      }
      return acc;
    };
  const objs = params.flat(Infinity) as Array<
      string | mdObj | null | undefined
    >,
    mdObjs = objs.reduce(reducer, []);
  return mdObjs;
};

/** render only main content (title, excrept, text comments) as paragraphs */
export const transformBasicNote = (note: Note): mdObj[] => {
  return toMDObjs(
    transformBasicNote_Title(note),
    transformBasicNote_Body(note),
  );
};

/** render note title as paragraphs */
export const transformBasicNote_Title = (note: Note): mdObj[] => {
  return toMDObjs(note.noteTitle);
};

/** render excrept and text comments as paragraphs */
export const transformBasicNote_Body = (note: Note): mdObj[] => {
  const { comments, excerptText } = note;

  return toMDObjs(excerptText, transformComments(comments));
};

/** render full note (linked notes, html comment...) in markdown format */
export const transformFullNote = (
  note: Note,
  headingLevel: Range<1, 7>,
  keepAlias: boolean,
): mdObj[] => {
  const title = transformFullNote_Title(note, headingLevel, keepAlias);
  return toMDObjs(title, transformFullNote_Body(note));
};

/** render full note title */
export const transformFullNote_Title = (
  note: Note,
  headingLevel: Range<1, 7>,
  keepAlias: boolean,
): mdObj[] | null => {
  let { noteTitle: srcTitle } = note;
  let aliasStr = "";
  if (!srcTitle) return null;

  const { title, aliases } = TitlelinkToAlias(srcTitle);

  if (keepAlias && aliases) aliasStr = aliases.join(", ");

  const mdObjs = [transformTitle(title, headingLevel)];
  if (aliases) mdObjs.push({ p: aliases });
  return mdObjs;
};

/** render full note body (excrept, text comments) */
export const transformFullNote_Body = (src: Note): mdObj[] => {
  const note = getSimpleNote(src);
  let obj: mdObj[];

  switch (note.type) {
    case "excerptNote": {
      const { excerpt, comments } = note;
      obj = toMDObjs(
        { blockquote: excerpt.text },
        transformComments(comments, true),
      );
      break;
    }
    case "note": {
      const { comments } = note;
      obj = toMDObjs(transformComments(comments, true));
      break;
    }
    case "excerpt": {
      const { excerpt } = note;
      obj = toMDObjs(excerpt.text);
      break;
    }
    default:
      assertNever(note);
  }

  return obj;
};
