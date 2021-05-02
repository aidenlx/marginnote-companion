import {
  linkComment,
  linkComment_pic,
  MbBookNote,
  noteComment,
} from "@alx-plugins/marginnote";
import assertNever from "assert-never";
import json2md, { DataObject as mdObj } from "json2md";
import { MDLink } from "../md-tools/MDLink";
import { mnUrl, Range } from "../misc";
import { getSimpleNote } from "./simpleNote";

const ext = {
  comment: (input: string): string => `%%${input}%%`,
  html: (html: string): string => html,
};

for (const k in ext) {
  json2md.converters[k] = ext[k as keyof typeof ext];
}

/** determine if link comment is a picture */
const isLC_pic = (lc: linkComment): lc is linkComment_pic =>
  (lc as linkComment_pic).q_hpic !== undefined;

export function TitlelinkToAlias(
  srcTitle: string
): { title: string; aliases: string[] | null } {
  if (!tlSeparator.test(srcTitle)) return { title: srcTitle, aliases: null };
  else {
    const [title, ...aliases] = srcTitle.split(tlSeparator);
    return { title, aliases };
  }
}

/**
 *
 * @param full true to export html and linknote
 * @returns
 */
export function transformComments(
  comments: noteComment[],
  full: boolean = false
): mdObj[] | null {
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
            if (isLC_pic(c) && !c.q_htext) {
              out.push({ comment: "PaintNote" });
            } else {
              out.push({ p: c.q_htext });
            }
          } else {
            if (c.q_htext) out.push({ p: c.q_htext });
          }
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
}

export function transformMNLink(
  type: "notebook" | "note",
  id: string,
  linktext?: string
): MDLink {
  return new MDLink(mnUrl(type, id), linktext, undefined, id.slice(-6));
}

/**
 *
 * @param str heading content
 * @param level range between 1 - 6
 * @returns a heading obj
 */
export function transformTitle(str: string, level: Range<1, 7> = 2): mdObj {
  if (Number.isInteger(level) && level >= 1 && level <= 6) {
    const headingType = "h" + level;
    return { [headingType]: str };
  } else throw new TypeError(`level ${level} invalid`);
}

/** title link separator */
export const tlSeparator = /[;；]/;

/**
 * recieve all params and return a merged json2md.DataObject array
 * @param srcs string is consider to be "p"
 * @returns 
 */
export function toMDObjs(
  ...srcs: Array<string | mdObj[] | mdObj | null | undefined>
): mdObj[] {
  const mdObjs: mdObj[] = [];
  let tempParas: string[] = [];

  const paras = () => (tempParas.length === 1 ? tempParas[0] : tempParas);

  function processObj(obj: mdObj) {
    if (obj?.p) {
      if (typeof obj.p === "string") tempParas.push(obj.p);
      else tempParas.push(...obj.p);
    } else {
      // push para first if exists
      if (tempParas.length !== 0) {
        mdObjs.push({ p: paras() });
        tempParas = [];
      }
      mdObjs.push(obj);
    }
  }

  for (let i = 0; i < srcs.length; i++) {
    const curr = srcs[i];
    if (curr) {
      if (typeof curr === "string") {
        tempParas.push(curr);
      } else if (Array.isArray(curr)) {
        for (const arrayObj of curr) {
          processObj(arrayObj);
        }
      } else {
        // typeof curr => mdObj
        processObj(curr);
      }
    }

    if (i === srcs.length - 1 && tempParas.length !== 0)
      mdObjs.push({ p: paras() });
  }

  return mdObjs;
}

/** render only main content (title, excrept, text comments) as paragraphs */
export function transformBasicNote(note: MbBookNote): mdObj[] {
  return toMDObjs(transformBasicNote_Title(note), transformBasicNote_Body(note));
}

/** render note title as paragraphs */
export function transformBasicNote_Title(note: MbBookNote): mdObj[] {
  return toMDObjs(note.noteTitle);
}

/** render excrept and text comments as paragraphs */
export function transformBasicNote_Body(note: MbBookNote): mdObj[] {
  const { comments, excerptText } = note;

  return toMDObjs(excerptText, transformComments(comments));
}

/** render full note (linked notes, html comment...) in markdown format */
export function transformFullNote(
  note: MbBookNote,
  headingLevel: Range<1, 7>,
  keepAlias: boolean
): mdObj[] {
  const title = transformFullNote_Title(note, headingLevel, keepAlias);
  return toMDObjs(title, transformFullNote_Body(note));
}

/** render full note title */
export function transformFullNote_Title(
  note: MbBookNote,
  headingLevel: Range<1, 7>,
  keepAlias: boolean
): mdObj[] | null {
  let { noteTitle: srcTitle } = note;
  let aliasStr = "";
  if (!srcTitle) return null;

  const {title, aliases} = TitlelinkToAlias(srcTitle);

  if (keepAlias && aliases) aliasStr = aliases.join(", ");

  const mdObjs = [transformTitle(title, headingLevel)];
  if (aliases) mdObjs.push({ p: aliases });
  return mdObjs;
}

/** render full note body (excrept, text comments) */
export function transformFullNote_Body(src: MbBookNote): mdObj[] {
  const note = getSimpleNote(src);
  let obj: mdObj[];

  switch (note.type) {
    case "excerptNote": {
      const { excerpt, comments } = note;
      obj = toMDObjs(
        { blockquote: excerpt.text },
        transformComments(comments, true)
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
}
