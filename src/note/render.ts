import json2md, { DataObject } from "json2md";
import { MDLink } from "md-tools/md-link";
import { Book, Note } from "@aidenlx/obsidian-bridge";
import { Editor, htmlToMarkdown } from "obsidian";
import { InsertTo, FindLine, SetLine } from "../cm-tools";
import { mnUrl } from "../misc";
import { excerptNote, getSimpleNote } from "./simple-note";
import {
  addToFrontmatter,
  getFrontmatterRange,
} from "md-tools/frontmatter";
import { TitlelinkToAlias } from "./transform";

export interface mdObj extends DataObject {
  comment?: string;
  html?: string;
}

const extension = {
  comment: (input: string): string => `%%${input}%%`,
  html: (html: string): string =>
    htmlToMarkdown(html.replace(/<head>(?:.|\n)+<\/head>/g, "")),
};

for (const k in extension) {
  json2md.converters[k] = extension[k as keyof typeof extension];
}

export { json2md };

export function insertRefSource(
  url: string,
  label: string,
  cm: CodeMirror.Editor | Editor,
) {
  const cursorLoc = cm.getCursor();

  let refSource = MDLink.getRefSource(url, label);

  for (let i = cursorLoc.line; i < cm.lineCount(); i++) {
    // if current line in cm is a heading or last line
    if (cm.getLine(i)?.startsWith("#") || i === cm.lineCount() - 1) {
      refSource = "\n" + refSource;
      // if current line in cm is not [label]: url
      if (!/^\[[A-Z0-9]{6,6}\]:/.test(<string>cm.getLine(i)))
        refSource = "\n" + refSource;
      InsertTo(refSource, cm, { line: i, ch: Infinity });
      if (cm.getCursor() != cursorLoc) cm.setCursor(cursorLoc);
      break;
    }
  }
}

export function importMeta(
  srcNote: Note,
  book: Book,
  updateH1: boolean,
  cm: CodeMirror.Editor | Editor,
): void {
  const note = getSimpleNote(srcNote);

  // import titlelink to alias, add h1 if not exists
  if (note.type !== "excerpt" && note.title) {
    const { title, aliases } = TitlelinkToAlias(note.title);

    if (aliases) {
      addToFrontmatter("aliases", aliases, cm);
    }

    const H1LineNum = FindLine(cm, /^# /);

    // add first title to h1 if not exist
    if (H1LineNum === -1) {
      const range = getFrontmatterRange(cm);
      const titleText = `\n\n# ${title}\n`;
      if (range) InsertTo(titleText, cm, range.to);
      else InsertTo(titleText, cm, 0, 0);
    } else if (updateH1) {
      // update h1 with first title
      SetLine(cm, H1LineNum, `# ${title}`);
    }
  }

  // import source
  const { id } = note;
  const { docMd5: md5, docTitle, pathFile: docPath } = book;

  if (md5) {
    const pageRange = (note as excerptNote).pageRange;
    const info: any = {
      md5,
      url: mnUrl("note", id),
    };
    if (pageRange) info.page = pageRange;
    addToFrontmatter("sources", { [docTitle ?? docPath ?? "null"]: info }, cm);
  } else console.error("docMd5 missing");
}
