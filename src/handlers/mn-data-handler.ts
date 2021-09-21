import { ReturnBody, ReturnBody_Note } from "@aidenlx/obsidian-bridge";
import assertNever from "assert-never";
import equal from "fast-deep-equal/es6";
import { EditorPosition, Loc, MarkdownView, Notice } from "obsidian";

import { FindLine, InsertToCursor } from "../cm-tools";
import t from "../lang/helper";
import { toPage } from "../misc";
import MNComp from "../mn-main";
import { DEFAULT_TPL_NAME } from "../settings";
import { getLink, Link } from "../template/basic";
import NoteTemplate, { getTitleAliases } from "../template/note-template";
import SelTemplate from "../template/sel-template";
import { NoTplFoundError, RenderError } from "../template/template";
import TocTemplate from "../template/toc-template";
import { TplCfgTypes } from "../typings/tpl-cfg";
import { addToFrontmatter, getFrontmatterRange } from "./frontmatter";

abstract class MNDataHandlerErr_General extends Error {
  constructor(public type: ErrType) {
    super(ErrType[type]);
    this.name = `MNDataHandlerErr(${ErrType[type]})`;
    switch (type) {
      case ErrType.NoMDView:
        this.message = "no active MarkdownView to insert note to";
        break;
      case ErrType.NoMNData:
        this.message = "No mn data to insert note to";
        break;
      case ErrType.NoTargetData:
      case ErrType.MissingData:
        break;
      default:
        assertNever(type);
    }
  }
}
class MNDataHandlerErr extends MNDataHandlerErr_General {
  constructor(
    public type: Exclude<ErrType, ErrType.NoTargetData | ErrType.MissingData>,
  ) {
    super(type);
  }
}
class NoTargetDataErr extends MNDataHandlerErr_General {
  constructor(public target: TplCfgTypes) {
    super(ErrType.NoTargetData);
    this.message = `No data with type ${target} found in cache`;
  }
}
class MissingDataErr extends MNDataHandlerErr_General {
  constructor(public missingProp: string, public body: ReturnBody) {
    super(ErrType.MissingData);
    this.message = `Missing ${missingProp} in data sent in ${body.sendTime}`;
  }
}

enum ErrType {
  NoMDView,
  NoMNData,
  NoTargetData,
  MissingData,
}

export const handleError = (
  error: unknown,
  callbacks?: Partial<{
    NoMNData: (error: MNDataHandlerErr) => void;
    final: (error: unknown) => void;
  }>,
) => {
  if (error instanceof RenderError) {
    new Notice(
      t("notice.error.render_error", {
        type: t(`settings.tpl_cfg.headings.${error.type}`),
        tpl: error.tplName,
        error: error.message,
      }),
    );
  } else if (error instanceof MNDataHandlerErr_General) {
    switch (error.type) {
      case ErrType.NoMDView:
        new Notice(t("notice.error.no_md_view"));
        break;
      case ErrType.NoMNData:
        if (callbacks?.NoMNData && error instanceof MNDataHandlerErr) {
          callbacks.NoMNData(error);
        } else new Notice(t("notice.error.no_mn_data"));
        break;
      case ErrType.NoTargetData:
        if (error instanceof NoTargetDataErr)
          new Notice(
            t("notice.error.no_target_data", {
              type: error.target
                ? t(`settings.tpl_cfg.headings.${error.target}`)
                : "",
            }),
          );
        break;
      case ErrType.MissingData:
        if (error instanceof MissingDataErr)
          new Notice(
            t("notice.error.body_missing_prop", {
              prop: error.missingProp,
              time: error.body.sendTime.toString(),
            }),
          );
        break;
      default:
        assertNever(error.type);
    }
  } else if (error instanceof NoTplFoundError) {
    new Notice(
      t("notice.error.no_tpl_found", {
        type: t(`settings.tpl_cfg.headings.${error.type}`),
        tpl: error.tplName,
      }),
    );
  } else {
    console.error(error as any);
  }
  callbacks?.final && callbacks.final(error);
};
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
  private async readFromInput() {
    const body = await this.plugin.inputListener.readFromInput();
    if (body) return body;
    else throw new MNDataHandlerErr(ErrType.NoMNData);
  }

  private refCallback = (view: MarkdownView) => (refSource: string) => {
    const { editor, file } = view,
      // cache = this.metadataCache.getFileCache(file),
      cursor = editor.getCursor();
    let def;
    if (
      false
      /* cache &&
      (def = findLast(cache.sections, (v) => v.type === "definition"))*/
    ) {
      // TODO
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
    try {
      if (!body) body = await this.readFromInput();
      let rendered: string;
      if (type !== body.type) throw new NoTargetDataErr(type);
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
      handleError(error);
      return null;
    }
  }
  async insertToNote(
    view?: MarkdownView,
    data?: {
      target: TplCfgTypes | ReturnBody;
      tplName: string;
    },
    callbacks?: Parameters<typeof handleError>[1],
    refSourceToBottom = true,
  ): Promise<void> {
    try {
      if (!view) {
        const val = this.activeMDView;
        if (val) view = val;
        else throw new MNDataHandlerErr(ErrType.NoMDView);
      }
      const refCallback = refSourceToBottom
        ? this.refCallback(view)
        : undefined;

      let body: ReturnBody, templateName: string;
      if (data) {
        const { target, tplName } = data;
        templateName = tplName;
        if (typeof target === "string") {
          body = await this.readFromInput();
          if (body.type !== target) throw new NoTargetDataErr(target);
        } else {
          body = target;
        }
      } else {
        body = await this.readFromInput();
        templateName = DEFAULT_TPL_NAME;
      }
      let template: string;
      switch (body.type) {
        case "sel":
          template = this.sel.render(body, templateName);
          break;
        case "note":
          template = await this.note.render(body, templateName, refCallback);
          break;
        case "toc":
          template = this.toc.render(body, templateName);
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
      handleError(error, callbacks);
    }
  }
  async importMeta(
    view: MarkdownView,
    body?: ReturnBody_Note,
    updateH1 = false,
  ): Promise<boolean> {
    try {
      if (!body) {
        const val = await this.readFromInput();
        if (val.type === "note") body = val;
        else throw new NoTargetDataErr("note");
      }
      const { editor } = view,
        { bookMap } = body,
        { noteTitle } = body.data;
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
      const { noteId, docMd5 } = body.data;
      if (!docMd5) throw new MissingDataErr("docMd5", body);
      const { docTitle, pathFile: docPath } = bookMap[docMd5];

      addToFrontmatter(
        "sources",
        {
          [docTitle ?? docPath ?? "null"]: getSrcInfo({
            md5: docMd5,
            url: getLink({ id: noteId })?.Url,
            page: toPage(body.data),
          }),
        },
        editor,
      );
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  }
}
const getSrcInfo = (info: {
  md5: string;
  url?: string;
  page?: ReturnType<typeof toPage>;
}) =>
  Object.keys(info).reduce((prev, k) => {
    const key = k as keyof typeof info;
    if (prev[key] === undefined) delete prev[key];
    return prev;
  }, info);
