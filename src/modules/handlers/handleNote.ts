import { Editor } from "obsidian";
import { getSimpleNote } from "modules/note/simpleNote";
import { ReturnBody_Note } from "@alx-plugins/obsidian-bridge";
import assertNever from "assert-never";
import { FindLine, InsertTo, InsertToCursor, SetLine } from "modules/cm-tools";
import {
  transformBasicNote,
  transformBasicNote_Body,
  transformFullNote,
  transformFullNote_Body,
  tlSeparator,
  TitlelinkToAlias,
} from "modules/note/transform";
import { getAnchor, MDLink, MDLinkType } from "modules/md-tools/MDLink";
import { MbBook, MbBookNote } from "@alx-plugins/marginnote";
import { mnUrl } from "modules/misc";
import json2md, { DataObject as mdObj } from "json2md";
import { addToFrontmatter, getFrontmatterRange } from "modules/frontmatter";

const enum NoteImportMode {
  /** Insert only link to cursor */
  LinkInsert,
  /** Insert only main content (title, excrept, text comments) to cursor */
  BasicInsert,
  /** Insert full note (linked notes, html comments...) with markdown format to cursor */
  FullInsert,
  /**
   * Merge note's title and link as metadata of current markdown file,
   * ignore anything else.
   */
  MetaMerge,
  /**
   * Merge note's title and link as metadata of current markdown file,
   * insert excrept and text comments to cursor
   */
  BasicMerge,
  /**
   * Merge note's title and link as metadata of current markdown file,
   * insert other contents (linked notes, html comments...) with markdown format to cursor
   */
  FullMerge,
}

export function handleNote(
  obj: ReturnBody_Note,
  cm: CodeMirror.Editor | Editor,
  mode: NoteImportMode = NoteImportMode.BasicInsert
): boolean {
  const { data: note, currentBook: book } = obj;
  if (!book) {
    console.error("missing currentBook in %o", obj);
    return false;
  }

  const InsertMDToCursor = (objs: mdObj[]) => InsertToCursor(json2md(objs), cm);
  let objs: mdObj[];
  switch (mode) {
    case NoteImportMode.LinkInsert:
      insertLink(MDLinkType.Ref, note, cm);
      break;
    case NoteImportMode.BasicInsert:
      objs = transformBasicNote(note);
      InsertMDToCursor(objs);
      insertLink(MDLinkType.Ref, note, cm);
      break;
    case NoteImportMode.FullInsert:
      objs = transformFullNote(note, 2, true);
      InsertMDToCursor(objs);
      insertLink(MDLinkType.Ref, note, cm);
      break;
    case NoteImportMode.MetaMerge:
      importMeta(note, book, cm);
      break;
    case NoteImportMode.BasicMerge:
      importMeta(note, book, cm);
      objs = transformBasicNote_Body(note);
      InsertMDToCursor(objs);
      break;
    case NoteImportMode.FullMerge:
      importMeta(note, book, cm);
      objs = transformFullNote_Body(note);
      InsertMDToCursor(objs);
      break;
    default:
      assertNever(mode);
  }
  return true;
}

function insertLink(
  linkType: MDLinkType,
  src: MbBookNote,
  cm: CodeMirror.Editor | Editor,
  linktext?: string
) {
  const cursorLoc = cm.getCursor();
  const { id } = getSimpleNote(src);
  const anchor = getAnchor(linkType, id, linktext);

  InsertToCursor(anchor, cm);

  if (linkType === MDLinkType.Ref) {
    let refSource = MDLink.getRefSource(mnUrl("note", id), id.slice(-6));

    for (let i = cursorLoc.line; i < cm.lineCount(); i++) {
      // if current line in cm is a heading or last line
      if (cm.getLine(i)?.startsWith("#") || i === cm.lineCount() - 1) {
        refSource = "\n" + refSource;
        // if current line in cm is not [label]: url
        if (!/^\[[A-Z0-9]{6,6}\]:/.test(<string>cm.getLine(i)))
          refSource = "\n" + refSource;
        InsertTo(refSource, cm, { line: i, ch: Infinity });
        break;
      }
    }
  }
}

function importMeta(
  srcNote: MbBookNote,
  book: MbBook,
  cm: CodeMirror.Editor | Editor
): void {
  const note = getSimpleNote(srcNote);

  // import titlelink to alias, add h1 if not exists
  if (note.type !== "excerpt" && note.title) {
    const { title, aliases } = TitlelinkToAlias(note.title);

    if (aliases) {
      addToFrontmatter("aliases", aliases, cm);
    }

    if (FindLine(cm, /^# /) === -1) {
      const range = getFrontmatterRange(cm);
      const titleText = `# ${title}\n\n`;
      if (range) InsertTo(titleText, cm, range.to);
      else InsertTo(titleText, cm, 0, 0);
    }
  }

  // import source
  const { id } = note;
  const { docMd5, docTitle, pathFile: docPath } = book;

  const sourceName = (docMd5 as string).slice(-6);

  addToFrontmatter("sources", { [sourceName]: mnUrl("note", id) }, cm);
}
