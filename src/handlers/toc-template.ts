import { ReturnBody_Toc, Toc } from "@aidenlx/obsidian-bridge";

import { WithUndefined } from "../misc";
import MNComp from "../mn-main";
import { getLink, Link } from "./basic";
import Template, { PHValMap } from "./template";

type TocRec = PHValMap<"Title" | "FilePath" | "DocTitle" | "DocMd5" | "Page"> &
  WithUndefined<{ Link: Link }>;

export class TocTemplate extends Template<"tocItem"> {
  private get indent(): string {
    const indentChar = this.vault.getConfig("useTab") ? "\t" : " ";
    return indentChar.repeat(this.vault.getConfig("tabSize"));
  }
  constructor(plugin: MNComp) {
    super(plugin, "tocItem");
  }
  render(body: ReturnBody_Toc): string {
    const indent = this.indent,
      val = localStorage.language,
      lang =
        typeof val === "string" && val.length >= 2 ? val.substring(0, 2) : "en",
      comparator = new Intl.Collator(lang, { numeric: true }).compare,
      { bookMap, data: toc } = body;

    const iterate = (toc: Toc, depth = 0): string => {
      const Page = toPage(toc),
        { noteId: id, noteTitle: Title, childNotes } = toc,
        DocMd5 = Page ? toc.docMd5 : undefined,
        docInfo = DocMd5 ? bookMap[DocMd5] : null;
      const rendered = this.renderTemplate<TocRec>(this.template, {
          Title,
          DocMd5,
          DocTitle: docInfo?.docTitle,
          FilePath: docInfo?.pathFile,
          Link: getLink({ id }),
          Page,
        }),
        lines = childNotes
          .sort((a, b) => comparator(a.noteTitle, b.noteTitle))
          .map((t) => iterate(t, depth + 1));
      lines.unshift(indent.repeat(depth) + rendered);
      return lines.join("\n");
    };

    return iterate(toc);
  }
}

const toPage = (toc: Toc): string | undefined => {
  const { startPage: start, endPage: end } = toc;
  if (start && end) return `page=${start}${start !== end ? "," + end : ""}`;
  else if (start || end) return `page=${start ? start : end}`;
  else return undefined;
};

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
