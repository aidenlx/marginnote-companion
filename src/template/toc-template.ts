import { ReturnBody_Toc, Toc } from "@aidenlx/obsidian-bridge";
import { stringify } from "query-string";

import { AddForEachProp } from "../misc";
import MNComp from "../mn-main";
import { getLink, Link } from "./basic";
import Template, { getViewKeys, PHValMap } from "./template";

type TocRec = PHValMap<"FilePath" | "DocTitle" | "DocMd5"> &
  AddForEachProp<{ Link: Link; Summary: TocItemSummary; Query: TocQuery }>;

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
    if (this.vault.getConfig("useTab")) return "\t";
    else return " ".repeat(this.vault.getConfig("tabSize"));
  }
  constructor(plugin: MNComp) {
    super(plugin, "toc");
  }
  prerender(body: ReturnBody_Toc, tplName: string): string {
    const templates = this.getTemplate(tplName);
    if (!templates) throw new Error("No template found for key " + tplName);

    const indent = this.indent,
      { bookMap, data: toc } = body;

    const iterate = (toc: Toc, depth = 0): string => {
      const Page = toPage(toc),
        {
          noteId: id,
          noteTitle: Title,
          childNotes,
          excerptText: Excerpt,
          notesText: AllText,
        } = toc,
        DocMd5 = Page ? toc.docMd5 : undefined,
        { docTitle: DocTitle, pathFile: FilePath } =
          bookMap[DocMd5 ?? ""] ?? {};
      const rendered = this.renderTemplate<TocRec>(templates.item, {
          DocMd5,
          DocTitle,
          FilePath,
          Link: getLink({ id }),
          Summary: new TocItemSummary(Title, Excerpt, AllText),
          Query: new TocQuery({ Page, DocMd5, DocTitle, FilePath }),
        }),
        lines = childNotes
          // .sort((a, b) =>
          //   comparator(
          //     TocItemSummary.getSummary(a),
          //     TocItemSummary.getSummary(b),
          //   ),
          // )
          .map((t) => iterate(t, depth + 1));
      lines.unshift(indent.repeat(depth) + rendered);
      return lines.join("\n");
    };
    return iterate(toc);
  }
  render(...args: Parameters<TocTemplate["prerender"]>): string {
    return this.prerender(...args);
  }
}

const toPage = (toc: Toc): number[] | undefined => {
  const { startPage: start, endPage: end } = toc;
  if (start && end) return [start, end];

  const toExport = start ? start : end;
  if (toExport) return [toExport];
  else return undefined;
};

export class TocItemSummary {
  constructor(
    public Title: string | undefined,
    public Excerpt: string | undefined,
    public AllText: string | undefined,
  ) {}

  toString(): string {
    return this.Title ?? this.Excerpt ?? this.AllText ?? "";
  }
  static getSummary(toc: Toc) {
    return toc.noteTitle ?? toc.excerptText ?? toc.notesText ?? "";
  }
}

const QueryKeys = ["Page", "DocMd5", "DocTitle", "FilePath"] as const;
type QueryObjRaw = AddForEachProp<
  {
    Page: number[];
    DocMd5: string;
    DocTitle: string;
    FilePath: string;
  },
  undefined
>;
type QueryObj = Map<
  keyof QueryObjRaw,
  Exclude<QueryObjRaw[keyof QueryObjRaw], undefined>
>;
const qsConfig = { arrayFormat: "comma", sort: false } as const;

export class TocQuery {
  constructor(private raw: QueryObjRaw) {}
  private queryObj: QueryObj = new Map();

  private addToQuery(key: keyof QueryObjRaw) {
    let rawVal;
    (rawVal = this.raw[key]) && this.queryObj.set(key, rawVal);
  }

  get isEmpty(): boolean {
    for (const v of Object.values(this.raw)) {
      if (v !== undefined) return false;
    }
    return true;
  }

  get Page(): TocQuery {
    this.addToQuery("Page");
    return this;
  }
  get DocMd5(): TocQuery {
    this.addToQuery("DocMd5");
    return this;
  }
  get DocTitle(): TocQuery {
    this.addToQuery("DocTitle");
    return this;
  }
  get FilePath(): TocQuery {
    this.addToQuery("FilePath");
    return this;
  }

  toString(): string {
    if (this.queryObj.size === 0) {
      QueryKeys.forEach((k) => this.addToQuery(k));
    }
    return stringify(Object.fromEntries(this.queryObj), qsConfig);
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
