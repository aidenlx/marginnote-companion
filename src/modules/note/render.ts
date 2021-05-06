import TurndownService from "turndown";
import json2md, { DataObject } from "json2md";
import { MDLink } from "modules/md-tools/MDLink";
import { MbBook, MbBookNote } from "@alx-plugins/marginnote";
import { Editor } from "obsidian";
import { InsertTo, FindLine, SetLine } from "modules/cm-tools";
import { mnUrl } from "modules/misc";
import { getSimpleNote } from "./simpleNote";
import { addToFrontmatter, getFrontmatterRange } from "modules/md-tools/frontmatter";
import { TitlelinkToAlias } from "./transform";

export interface mdObj extends DataObject {
  comment?: string;
  html?: string;
}

const tdService = new TurndownService();

const extension = {
  comment: (input: string): string => `%%${input}%%`,
  html: (html: string): string =>
    tdService.turndown(html.replace(/<head>(?:.|\n)+<\/head>/g, "")),
};

for (const k in extension) {
  json2md.converters[k] = extension[k as keyof typeof extension];
}

export { json2md };

export function insertRefSource(
  url: string,
  label: string,
  cm: CodeMirror.Editor | Editor
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
      if (cm.getCursor()!=cursorLoc) cm.setCursor(cursorLoc)
      break;
    }
  }
}

export function importMeta(
  srcNote: MbBookNote,
  book: MbBook,
  updateH1: boolean,
  cm: CodeMirror.Editor | Editor
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
  const { docMd5, docTitle, pathFile: docPath } = book;

  if (docMd5)
    addToFrontmatter(
      "sources",
      { [docTitle ?? "null"]: [docMd5, mnUrl("note", id)] },
      cm
    );
  else console.error("docMd5 missing");
}