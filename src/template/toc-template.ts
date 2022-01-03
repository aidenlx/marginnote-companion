import { ReturnBody_Toc, Toc } from "@aidenlx/obsidian-bridge";

import { AddForEachProp, getBookFromMap, toPage } from "../misc";
import MNComp from "../mn-main";
import Link from "./basic/link";
import Query from "./basic/query";
import Template, { getViewKeys, PHValMap } from "./template";

type TocRec = PHValMap<"FilePath" | "DocTitle" | "DocMd5"> &
  AddForEachProp<{ Link: Link; Summary: TocItemSummary; Query: Query }>;

export const TocViewKeys = getViewKeys<keyof TocRec>({
  FilePath: null,
  DocTitle: null,
  DocMd5: null,
  Link: null,
  Summary: null,
  Query: null,
});

const val = localStorage.language,
  lang =
    typeof val === "string" && val.length >= 2 ? val.substring(0, 2) : "en",
  comparator = new Intl.Collator(lang, { numeric: true }).compare;
export default class TocTemplate extends Template<"toc"> {
  private get indent(): string {
    // if not use tab, always use 4 space in accordance with markdown spec
    return this.vault.getConfig("useTab") ? "\t" : "    ";
  }
  constructor(plugin: MNComp) {
    super(plugin, "toc");
  }
  prerender(body: ReturnBody_Toc, tplName: string): string {
    const { templates, indentChar } = this.getTplCfg(tplName),
      indent = indentChar === true ? this.indent : indentChar,
      { bookMap, data: toc } = body;

    try {
      const iterate = (toc: Toc, depth = 0): string => {
        const Page = toPage(toc),
          {
            noteId: id,
            noteTitle: Title,
            childNotes,
            excerptText: Excerpt,
            notesText: AllText,
            docMd5: DocMd5,
          } = toc,
          { docTitle: DocTitle, pathFile: FilePath } = getBookFromMap(
            DocMd5,
            bookMap,
          );
        const rendered = this.renderTemplate<TocRec>(templates.item, {
            DocMd5,
            DocTitle,
            FilePath,
            Link: Link.getInst({ id }),
            Summary: new TocItemSummary(Title, Excerpt, AllText),
            Query: new Query({ Page, DocMd5, DocTitle, FilePath }),
          }),
          lines = Array.isArray(childNotes)
            ? childNotes
                // .sort((a, b) =>
                //   comparator(
                //     TocItemSummary.getSummary(a),
                //     TocItemSummary.getSummary(b),
                //   ),
                // )
                .map((t) => iterate(t, depth + 1))
            : [];
        lines.unshift(indent.repeat(depth) + rendered);
        return lines.join("\n");
      };
      return iterate(toc);
    } catch (error) {
      throw this.RenderError(error, tplName);
    }
  }
  render(...args: Parameters<TocTemplate["prerender"]>): string {
    return this.prerender(...args);
  }
}

export class TocItemSummary {
  private _comments: string[];
  public get Comments(): string | undefined {
    return this._comments.length > 0 ? this._comments.join("; ") : undefined;
  }

  public Excerpt: string | undefined;
  constructor(
    public Title: string | undefined,
    excerpt: string | undefined,
    comments: string | undefined,
  ) {
    this.Excerpt = excerpt?.trim().replace(/\n+/g, " ");
    this._comments = comments
      ? comments
          .trim()
          .split(/\n{2,}/g)
          .map((str) => str.replace(/\n/g, " "))
      : [];
  }

  get AllText() {
    const texts = this.Excerpt
      ? [this.Excerpt].concat(this._comments)
      : this._comments;
    return texts.join("; ");
  }

  toString(): string {
    return this.Title ?? this.Excerpt ?? this.Comments ?? "";
  }
  static getSummary(toc: Toc) {
    return toc.noteTitle ?? toc.excerptText ?? toc.notesText ?? "";
  }
}

// async function cmdOutlineHandler(plugin: MNComp): Promise<void> {
//   console.log("called");

//   const cbText = await navigator.clipboard.readText();

//   const ReturnBody = isMNData(cbText);

//   if (!ReturnBody || ReturnBody.type === "sel") {
//     console.error("invalid");
//     return;
//   }

//   const { data } = ReturnBody;

//   if (data.parentNote) {
//     console.error("not top level");
//     return;
//   }

//   const {
//     childNotes: children,
//     noteId: id,
//     noteTitle: bookName,
//     docMd5: bookMd5,
//   } = data;

//   interface Container<T> {
//     [index: number]: Container<T> | T;
//   }

//   interface child {
//     id: string;
//     title: string;
//     children: child[];
//   }
//   const childList: child[] = [];

//   function scan(note: MbBookNote): child {
//     const temp: child[] = [];
//     const { childNotes: children, noteId: id, noteTitle: title } = note;
//     for (const subnote of children) {
//       temp.push(scan(subnote));
//     }
//     return {
//       id: id ?? "",
//       title: title ?? "",
//       children: temp,
//     };
//   }

//   for (const child of children) {
//     childList.push(scan(child));
//   }
//   console.log("scan completed: %o", childList);

//   const render = (fmObj: { [k: string]: any }) =>
//     matter.stringify("", fmObj).replace(/^\s+|\s+$/g, "");

//   const getFm = (id: string) =>
//     render({ sources: { [bookName ?? "null"]: [bookMd5, mnUrl("note", id)] } });
//   const getDoc = (title: string, id: string) =>
//     getFm(id) + `\n\n# ${title}\n\n`;
//   const tocDoc = getDoc(bookName ?? "", id ?? "");
//   const basePath = bookName ?? "unknown";
//   await plugin.app.vault.createFolder(basePath);

//   const array: string[] = [];

//   async function it(note: child, level = 0, base = basePath) {
//     const { children, id, title } = note;
//     const path = join(base, title);
//     const titleText = title.replace(/^.+? /, "");
//     if (children.length === 0) {
//       plugin.app.vault
//         .create(join(base, titleText + ".md"), getDoc(titleText, id))
//         .then(() => console.log("write: " + path + ".md"));
//     } else {
//       await plugin.app.vault.createFolder(path);
//       console.log("mkdir: " + path);
//       plugin.app.vault
//         .create(join(base, title + ".md"), getDoc(title, id))
//         .then(() => console.log("write dir: " + path + ".md"));

//       for (const subnote of children) {
//         it(subnote, level + 1, path);
//       }
//     }
//   }

//   function toc(note: child, level = 0) {
//     const { children, id, title } = note;

//     array.push("  ".repeat(level) + `- [[${title}]]`);

//     for (const subnote of children) {
//       toc(subnote, level + 1);
//     }
//   }

//   for (const child of childList) {
//     toc(child);
//   }
//   await plugin.app.vault
//     .create(join(basePath, "_toc.md"), tocDoc + array.join("\n"))
//     .then(() => console.log("toc created"));

//   childList.forEach((child) => it(child));
// }
