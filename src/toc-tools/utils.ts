import { Content, Link, ListItem, Paragraph, Text } from "mdast";
import { Editor, EditorChange, EditorRange } from "obsidian";
import { parse } from "query-string";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { pointEnd, pointStart, position } from "unist-util-position";
import { matches, select, selectAll } from "unist-util-select";
import { source } from "unist-util-source";

import {
  fetchTextForChildren,
  getLinePos,
  getSection,
  LinkWithLT,
  UPointToObPos,
  UPosToObRange,
} from "./basic";

interface LinkInfo {
  book: string;
  url: string;
  md5: string;
  page: [start: number, end: number];
}

interface FmSrcInfo {
  [book: string]: {
    md5: string;
    url: string;
    page: [start: number, end: number];
  };
}

const indentChar = "  ";
export const getIndentLevel = (line: string) => {
  let index = line.search(/[^ ]/); // index of first non-space char
  return index >= 0 ? index / indentChar.length : -1;
};

export const getLinkInfo = (links: LinkWithLT[]) =>
  links.map((link) => {
    const { linktext: book, title, url } = link,
      qs = title as string,
      { "doc-md5": md5, page } = parse(qs, { arrayFormat: "comma" });

    return {
      book,
      url,
      md5,
      page: (page as string[]).map((str) => +str) as [
        start: number,
        end: number,
      ],
    } as LinkInfo;
  });

export const linkToFmSources = (links: LinkInfo[]): FmSrcInfo =>
  links.reduce((srcs, link) => {
    const { book, md5, url, page } = link;
    srcs[book] = { md5, url, page };
    return srcs;
  }, {} as FmSrcInfo);

const isLinks = (children: Content[]): children is (Link | Text)[] =>
  children.length > 0 && children.every(isLinknEmptyText);

const isLinknEmptyText = (node: Content): node is Text | Link => {
  switch (node.type) {
    case "link":
      return isMNLink(node);
    case "text":
      return !node.value.trim();
    default:
      return false;
  }
};

const mnlinkSelector = 'link[url^="marginnote3app"][title]';
const isMNLink = (node: Content): node is Link => {
  if (
    matches<Link & { title: string }>(mnlinkSelector, node) &&
    node.children.length > 0
  ) {
    const qsObj = parse(node.title, { arrayFormat: "comma" });
    return (
      "doc-md5" in qsObj &&
      Array.isArray(qsObj.page) &&
      qsObj.page.length === 2 &&
      qsObj.page.every((str) => Number.isInteger(+str) && +str > 0)
    );
  }
  return false;
};

const LinkAddLT = (src: string) => (link: Link) => {
  (link as LinkWithLT).linktext = fetchTextForChildren(src, link.children);
  return link as LinkWithLT;
};

export const matchLinkOnly = (editor: Editor, from: number, to: number) => {
  const sectionStr = getSection(editor, from, to),
    root = unified().use(remarkParse).parse(sectionStr),
    para = select<Paragraph>(":root > heading + paragraph", root);
  if (!para || !isLinks(para.children)) return null;
  const linksRaw = selectAll<Link>("link", para).map(LinkAddLT(sectionStr));
  return {
    links: getLinkInfo(linksRaw),
    getSection: (headingMark: string, no1stLink: boolean) => {
      let sec = sectionStr;
      if (no1stLink)
        sec =
          sec.substring(0, pointStart(para).offset) +
          sec.substring(pointEnd(para).offset as number);
      return sec.replace(new RegExp(`^${headingMark}`, "gm"), "#");
    },
    // remove1stLink: [
    //   { ...UPosToObRange(position(para), getLinePos(from)), text: "" },
    // ],
    // removeSection: [{ from: getLinePos(from), to: getLinePos(to), text: "" }],
  };
};

export const matchLinks = (editor: Editor, ranges: EditorRange[]) => {
  let linkInfos: LinkInfo[] = [],
    changes: EditorChange[] = [];
  ranges.forEach((range) => {
    const sectionStr = editor.getRange(range.from, range.to),
      root = unified().use(remarkParse).parse(sectionStr),
      links = selectAll<Link>(mnlinkSelector, root).filter(isMNLink);
    if (links.length === 0) return;
    const linksRaw = links.map(LinkAddLT(sectionStr));

    linkInfos.push(...getLinkInfo(linksRaw));
    linksRaw.forEach((link) =>
      changes.push({
        ...UPosToObRange(position(link), range.from),
        text: "",
      }),
    );
  });

  return { links: linkInfos, changes };
};

export const matchEntry = (editor: Editor, line?: number) => {
  const lineNum = line === undefined ? editor.getCursor().line : line;
  if (lineNum < 0 || lineNum >= editor.lineCount()) return null;
  const lineStr = getSection(editor, lineNum),
    root = unified().use(remarkParse).parse(lineStr),
    li = select<ListItem>(":root > list > listItem", root),
    p = li && select<Paragraph>("paragraph:first-child", li);
  if (!li || !p) return null;

  const prefixPos = {
      start: { ...pointStart(li), column: 1 },
      end: pointStart(p),
    },
    prefix = source(prefixPos, lineStr);
  if (!prefix) return null;
  const firstLinkIndex = p.children.findIndex(isMNLink);
  if (firstLinkIndex <= 0) return null; // no title or no link
  const descNodes = p.children.slice(0, firstLinkIndex),
    linknTextNodes = p.children.slice(firstLinkIndex);
  if (!isLinks(linknTextNodes)) return null;
  const desc = fetchTextForChildren(lineStr, descNodes),
    linksRaw = linknTextNodes
      .filter((node): node is Link => node.type === "link")
      .map(LinkAddLT(lineStr)),
    links = getLinkInfo(linksRaw),
    linkRawText = fetchTextForChildren(lineStr, linknTextNodes);
  const deeperIndentPattern = new RegExp(`^(?:${indentChar})+${prefix}`);
  return {
    links,
    desc,
    prefix,
    replacePara: (
      replaceFunc: (
        desc: string,
        links: LinkInfo[],
        linksRaw: string,
      ) => string,
    ): EditorChange => ({
      ...UPosToObRange(position(p), getLinePos(lineNum)),
      text: replaceFunc(desc, links, linkRawText),
    }),
    replacePrefix: (replaceFunc: (prefix: string) => string): EditorChange => ({
      ...UPosToObRange(prefixPos, getLinePos(lineNum)),
      text: replaceFunc(prefix),
    }),
    replaceLine: (
      replaceFunc: (
        prefix: string,
        desc: string,
        linksRaw: string,
        links: LinkInfo[],
      ) => string,
    ): EditorChange => ({
      ...UPosToObRange(
        { start: { ...pointStart(li), column: 1 }, end: pointEnd(li) },
        getLinePos(lineNum),
      ),
      text: replaceFunc(prefix, desc, linkRawText, links),
    }),
    isDeeper: (line: string) => deeperIndentPattern.test(line),
    outdentLine: (line: string) => {
      const srcIndentLength = prefix.search(/[^ ]/);
      return line.substring(
        indentChar.length + (srcIndentLength < 0 ? 0 : srcIndentLength),
      );
    },
  };
};
