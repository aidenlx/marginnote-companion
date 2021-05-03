import { Editor } from "obsidian";
import { ReturnBody_Note } from "@alx-plugins/obsidian-bridge";
import assertNever from "assert-never";
import { InsertToCursor } from "modules/cm-tools";
import {
  transformBasicNote,
  transformBasicNote_Body,
  transformFullNote,
  transformFullNote_Body,
} from "modules/note/transform";
import { getAnchor, MDLinkType } from "modules/md-tools/MDLink";
import { importMeta, insertRefSource, json2md, mdObj } from "../note/render";
import { mnUrl } from "modules/misc";

export const enum NoteImportStyle {
  /** Import only metadata (link, alias, source...) */
  Metadata,
  /** Import basic note content (title, excrept, text comments) in markdown paragraphs */
  Basic,
  /** Import full note (linked notes, html comments...) */
  Full
}

export const enum NoteImportMode {
  /** Insert all content to cursor */
  Insert,
  /** Merge metadata to heading and frontmatter */
  Merge
}

export interface NoteImportOption {
  importStyle: NoteImportStyle,
  importMode: NoteImportMode,
  blanksAroundSingleLine: boolean
}

export function handleNote(
  obj: ReturnBody_Note,
  cm: CodeMirror.Editor | Editor,
  options: NoteImportOption
): boolean {
  const { data: note, currentBook: book } = obj;
  if (!book) {
    console.error("missing currentBook in %o", obj);
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
    case NoteImportMode.Insert:{
      const { noteId:id } = note;
      if (!id) {
        console.error("missing noteId");
        return false;
      }

      const linkType = MDLinkType.Ref;

      const anchor = getAnchor(linkType, id, id.slice(-6));

      const insertLinkTo = (index: number, fallback:Function) => {
        const whitelist : (keyof mdObj)[]= ["p", "blockquote"];
        let success = false;
        for (const k of whitelist) {
          if (body[index][k]) {
            body[index][k] += anchor;
            success = true;
          }
        }
        if (!success) fallback();
      };

      if (body.length === 0) {
        body.push({ p: anchor });
      } else if (body.length === 1) {
        insertLinkTo(0, () => body.push({ p: anchor }));
      } else {
        insertLinkTo(1, () => body.splice(2, 0, { p: anchor }));
      }

      if (linkType===MDLinkType.Ref)
        insertRefSource(mnUrl("note", id), id.slice(-6), cm);
    } break;
    case NoteImportMode.Merge:
      importMeta(note, book, false, cm);
      break;
    default:
      assertNever(options.importMode);
  }

  let insert = json2md(body).replace(/\n{3,}/g,"\n\n");
  
  if (
    !options.blanksAroundSingleLine &&
    !insert.replace(/^\n+|\n+$/g, "").includes("\n")
  ) {
    insert = insert.replace(/^\n+|\n+$/g, "");
  }

  InsertToCursor(insert, cm);
  
  return true;
}