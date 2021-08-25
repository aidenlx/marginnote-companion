import { Book, ReturnBody_Note } from "@aidenlx/obsidian-bridge";
import assertNever from "assert-never";
import { Editor } from "obsidian";

import { InsertToCursor } from "../cm-tools";
import { getAnchor, MDLinkType } from "../md-tools/md-link";
import { mnUrl } from "../misc";
import { importMeta, insertRefSource, json2md, mdObj } from "../note/render";
import { transformBasicNote, transformFullNote } from "../note/transform";

export const enum NoteImportStyle {
  /** Import only metadata (link, alias, source...) */
  Metadata,
  /** Import basic note content (title, excrept, text comments) in markdown paragraphs */
  Basic,
  /** Import full note (linked notes, html comments...) */
  Full,
}

export const enum NoteImportMode {
  /** Insert all content to cursor */
  Insert,
  /** Merge metadata to heading and frontmatter */
  Merge,
}

export interface NoteImportOption {
  importStyle: NoteImportStyle;
  importMode: NoteImportMode;
  blanksAroundSingleLine: boolean;
  /** whether update existing H1 with metadata title,
   * Passed to importMeta()
   */
  updateH1: boolean;
}

const handleNote = (
  obj: ReturnBody_Note,
  cm: CodeMirror.Editor | Editor,
  options: NoteImportOption,
): boolean => {
  const { data: note, bookMap } = obj,
    book: Book | undefined = note.docMd5 ? bookMap[note.docMd5] : undefined;
  if (!book) {
    console.error(`missing book ${note.docMd5} in bookmap %o`, bookMap, obj);
    return false;
  }

  let body: mdObj[];

  switch (options.importStyle) {
    case NoteImportStyle.Metadata:
      body = [];
      break;
    case NoteImportStyle.Basic:
      body = transformBasicNote(note);
      break;
    case NoteImportStyle.Full:
      body = transformFullNote(note, 2, true);
      break;
    default:
      assertNever(options.importStyle);
  }

  switch (options.importMode) {
    case NoteImportMode.Insert:
      {
        const { noteId: id } = note;
        if (!id) {
          console.error("missing noteId");
          return false;
        }

        const linkType = MDLinkType.Ref;

        const anchor = getAnchor(linkType, id, id.slice(-6));

        const insertLinkTo = (index: number, fallback: Function) => {
          let curIndex = 0;
          for (const obj of body) {
            const typeKey = Object.keys(obj)[0] as keyof mdObj;
            const value = obj[typeKey];
            if (
              Array.isArray(value) &&
              value.length > 0 &&
              typeof value[0] === "string"
            ) {
              for (let i = 0; i < value.length; i++) {
                if (curIndex === index) {
                  value[i] += anchor;
                  return;
                }
                curIndex++;
              }
            } else if (typeof value === "string") {
              if (curIndex === index) {
                obj[typeKey] += anchor;
                return;
              }
            } else {
              if (curIndex === index) {
                fallback();
                return;
              }
            }
          }
        };

        const getLength = (array: mdObj[]): number => {
          let length = 0;
          for (const obj of array) {
            if (obj.p && Array.isArray(obj.p)) {
              length = length + obj.p.length;
            } else length++;
          }
          return length;
        };

        const length = getLength(body);
        if (length === 0) {
          body.push({ p: anchor });
        } else if (length === 1) {
          insertLinkTo(0, () => body.push({ p: anchor }));
        } else {
          insertLinkTo(1, () => body.splice(2, 0, { p: anchor }));
        }

        if (linkType === MDLinkType.Ref)
          insertRefSource(mnUrl("note", id), id.slice(-6), cm);
      }
      break;
    case NoteImportMode.Merge:
      importMeta(note, book, options.updateH1, cm);
      break;
    default:
      assertNever(options.importMode);
  }

  if (body.length === 0) return true;

  let insert = json2md(body).replace(/\n{3,}/g, "\n\n");

  if (
    !options.blanksAroundSingleLine &&
    !insert.replace(/^\n+|\n+$/g, "").includes("\n")
  ) {
    insert = insert.replace(/^\n+|\n+$/g, "");
  }

  InsertToCursor(insert, cm);

  return true;
};

export default handleNote;
