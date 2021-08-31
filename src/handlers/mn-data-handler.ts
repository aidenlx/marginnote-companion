import { ReturnBody, ReturnBody_Note } from "@aidenlx/obsidian-bridge";
import assertNever from "assert-never";
import equal from "fast-deep-equal/es6";
import { EditorPosition, Loc, MarkdownView, Notice } from "obsidian";

import { FindLine, InsertToCursor } from "../cm-tools";
import MNComp from "../mn-main";
import { TplCfgTypes } from "../typings/tpl-cfg";
import { getLink, Link } from "./basic";
import { addToFrontmatter, getFrontmatterRange } from "./frontmatter";
import NoteTemplate, { getTitleAliases } from "./note-template";
import SelTemplate from "./sel-template";
import { TocTemplate } from "./toc-template";

export const enum InsertNoteResult {
  NoMDView = -1,
  Error = 0,
  Success = 1,
  NoMNData,
  NoVaildData,
}

export default class MNDataHandler {
  private note = new NoteTemplate(this.plugin);
  private sel = new SelTemplate(this.plugin);
  private toc = new TocTemplate(this.plugin);

  constructor(private plugin: MNComp) {}
  private get settings() {
    return this.plugin.settings;
  }
  private get workspace() {
    return this.plugin.app.workspace;
  }
  private get metadataCache() {
    return this.plugin.app.metadataCache;
  }

  private get activeMDView() {
    return this.workspace.getActiveViewOfType(MarkdownView);
  }
  private readFromInput() {
    return this.plugin.inputListener.readFromInput();
  }

  private callback = (view: MarkdownView) => (refSource: string) => {
    const { editor, file } = view,
      cache = this.metadataCache.getFileCache(file),
      cursor = editor.getCursor();
    let def;
    if (
      false
      /* cache &&
      (def = findLast(cache.sections, (v) => v.type === "definition"))*/
    ) {
      const { start, end } = def.position,
        cvt = (a: Loc): EditorPosition => ({ line: a.line, ch: a.col }),
        from = cvt(start),
        to = cvt(end);
      editor.replaceRange("", from, to);
    } else {
      // insert to last line
      const last = editor.lastLine(),
        toInsert = Link.getToInsertLast(
          editor.getRange(
            { line: last - 3 > 0 ? last - 3 : 0, ch: 0 },
            { line: last, ch: Infinity },
          ),
          refSource,
        );
      editor.replaceRange(toInsert, { line: last, ch: Infinity });
    }
    // resume cursor
    if (!equal(cursor, editor.getCursor)) editor.setCursor(cursor);
  };

  async previewWith(
    type: TplCfgTypes,
    tplName: string,
    body?: ReturnBody,
  ): Promise<string | null> {
    if (!body) {
      const val = await this.readFromInput();
      if (!val) {
        new Notice("No MNData available for preview");
        return null;
      } else {
        body = val;
      }
    }
    try {
      let rendered: string;
      if (type !== body.type) {
        new Notice(`${type} cannot be used on ${body.type} MNData`);
        return null;
      }
      switch (body.type) {
        case "sel":
          rendered = this.sel.prerender(body, tplName);
          break;
        case "note":
          rendered = this.note.prerender(body, tplName);
          break;
        case "toc":
          rendered = this.toc.prerender(body, tplName);
          break;
        default:
          assertNever(body);
      }
      return rendered;
    } catch (error) {
      new Notice(error);
      return null;
    }
  }

  async insertToNote(
    view?: MarkdownView,
    body?: ReturnBody,
    refSourceToBottom = true,
  ): Promise<InsertNoteResult> {
    if (!view) {
      const val = this.activeMDView;
      if (val) view = val;
      else {
        console.error("no active MarkdownView to insert note to");
        return InsertNoteResult.NoMDView;
      }
    }
    const refCallback = refSourceToBottom ? this.callback(view) : undefined;

    if (!body) {
      const val = await this.readFromInput();
      if (!val) {
        // console.log("no mn data to insert note to, do nothing");
        return InsertNoteResult.NoMNData;
      } else body = val;
    }
    try {
      let template: string;
      switch (body.type) {
        case "sel":
          template = this.sel.render(body, "default");
          break;
        case "note":
          template = await this.note.render(body, "default", refCallback);
          break;
        case "toc":
          template = this.toc.render(body, "default");
          break;
        default:
          assertNever(body);
      }
      if (view.editor.somethingSelected()) {
        view.editor.replaceSelection(template);
      } else {
        InsertToCursor(template, view.editor);
      }
    } catch (error) {
      console.error(error);
      return InsertNoteResult.Error;
    } finally {
      return InsertNoteResult.Success;
    }
  }
  async importMeta(
    view: MarkdownView,
    body?: ReturnBody_Note,
    updateH1 = false,
  ): Promise<boolean> {
    if (!body) {
      const val = await this.readFromInput();
      if (val && val.type === "note") body = val;
      else return false;
    }
    const { editor } = view,
      { bookMap } = body,
      { noteTitle, noteId, docMd5, startPage, endPage } = body.data;
    // import titlelink to alias, add h1 if not exists
    if (noteTitle) {
      const [title, aliases] = getTitleAliases(noteTitle);

      if (aliases.length === 0) {
        addToFrontmatter("aliases", aliases, editor);
      }

      const H1LineNum = FindLine(editor, /^# /);

      // add first title to h1 if not exist
      if (H1LineNum === -1) {
        const range = getFrontmatterRange(editor);
        const titleText = `\n\n# ${title}\n`;
        if (range) editor.replaceRange(titleText, range.to);
        else editor.replaceRange(titleText, { line: 0, ch: 0 });
      } else if (updateH1) {
        // update h1 with first title
        editor.setLine(H1LineNum, `# ${title}`);
      }
    }

    // import source
    if (docMd5) {
      const { docTitle, pathFile: docPath } = bookMap[docMd5];

      const pageRange =
        isPosInteger(startPage) && isPosInteger(endPage)
          ? [startPage, endPage]
          : null;
      let url,
        info: any = { md5: docMd5 };
      if ((url = getLink({ id: noteId }))) {
        info.url = url;
      } else console.error("noteId not found in %o", body);
      if (pageRange) info.page = pageRange;
      addToFrontmatter(
        "sources",
        { [docTitle ?? docPath ?? "null"]: info as {} },
        editor,
      );
    } else {
      console.error("docMd5 missing");
      return false;
    }
    return true;
  }
}

const isPosInteger = (num: any): num is number =>
  Number.isInteger(num) && num > 0;
