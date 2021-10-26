import { Editor } from "obsidian";

const patterns = {
  entry:
    /^(?<indent>(?:  )*)(?<listmark>- )(?<title>[^:]+?)?(?<links>(?:\[[^\]]+?\]\(marginnote3app[^ \)]+? "[^\)]*"\))+)\s*$/m,
  linkOnlyEntry:
    /^(?<heading># .+)\s*(?<links>(?:\[[^\]]+?\]\(marginnote3app[^ \)]+? "[^\)]*"\)\s*)+)\s*$/m,
  links:
    /\[(?<book>[^\]]+?)\]\((?<url>marginnote3app[^ \)]+?) "page=(?<page1>\d+?),(?<page2>\d+?)&doc-md5=(?<md5>[^:\W]+?)"\)/g,
};
const indentChar = "  ";

export interface LinkInfo {
  book: string;
  url: string;
  md5: string;
  page: [start: number, end: number];
}

type MatchedInfo = ReturnType<typeof matchEntry>;

export const test = (line: string, linkOnly = false): boolean =>
  RegExp.prototype.test.call(
    linkOnly ? patterns.linkOnlyEntry : patterns.entry,
    line,
  ) && testLink(line);
export const matchEntry = (line: string) => {
  let matched = line.match(patterns.entry);
  if (!matched || !matched.groups) return null;

  const {
    links: linksRaw,
    indent,
    title,
    listmark,
  } = matched.groups as Partial<typeof matched.groups> & { links: string };

  if (!linksRaw) {
    console.log("missing links in:", line);
    return null;
  }

  const nextIndentPattern = new RegExp(
    `^${indent}${indentChar}((?:${indentChar})*${listmark})`,
    "m",
  );
  return {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    replaceTitleWith: (str?: string) => {
      return (indent ?? "") + (listmark ?? "") + (str ?? title ?? "");
    },
    removeNextIndent: (str: string) => str.replace(nextIndentPattern, "$1"),
    isNextIndent: (str: string) => nextIndentPattern.test(str),
    indent: indent ?? "",
    // indentChar,
    // get currIndentLevel(): number {
    //   return (indent?.length ?? 0) / indentChar.length;
    // },
    title: title ?? "",
    links: getLinkInfo(linksRaw),
  };
};
export const entry2Heading = (section: string, refEntry?: string) => {
  const level = refEntry?.match(patterns.entry)?.groups?.indent?.length ?? -1;
  return section
    .replace(
      new RegExp(patterns.entry, patterns.entry.flags + "g"),
      (...args) => {
        let group = args.last() as Record<"indent" | "title" | "links", string>;
        if (
          group &&
          typeof group.indent === "string" &&
          typeof group.title === "string" &&
          typeof group.links === "string"
        ) {
          if (level < 0 || group.indent.length / indentChar.length <= level) {
            const headingMark =
              "#" + group.indent.replace(new RegExp(indentChar, "g"), "#");
            return `\n${headingMark} ${group.title}\n\n${group.links}\n`;
          } else return args[0].substring((level + 1) * indentChar.length);
        } else throw new Error("Missing group in match result");
      },
    )
    .replace(/^\n+|\n+$/g, "");
};
export const matchLinkOnly = (section: string) => {
  let matched = section.match(patterns.linkOnlyEntry);
  if (!matched || !matched.groups) return null;

  const { links: linksRaw } = matched.groups;

  if (!linksRaw) {
    console.log("missing links in:", section);
    return null;
  }

  return {
    links: getLinkInfo(linksRaw),
    linksRemoved: section.replace(patterns.linkOnlyEntry, "$1\n"),
  };
};

export const testLink = (str: string) => (
  (patterns.links.lastIndex = 0), patterns.links.test(str)
);
export const replaceLink = (str: string, replaceValue: string) => (
  (patterns.links.lastIndex = 0), str.replace(patterns.links, replaceValue)
);
export const getLinkInfo = (str: string) => (
  (patterns.links.lastIndex = 0),
  [...str.matchAll(patterns.links)].map((matched) => {
    const { book, url, page1, page2, md5 } = matched.groups as Record<
      string,
      string
    >;
    return {
      book,
      url,
      md5,
      page: [+page1, +page2] as [start: number, end: number],
    } as LinkInfo;
  })
);

export const getFirstSelectedLine = (editor: Editor) => {
  const { line } = editor.getCursor();
  let sel = editor.getLine(line);
  return { lineNum: line, line: sel };
};

interface FmSrcInfo {
  [book: string]: {
    md5: string;
    url: string;
    page: [start: number, end: number];
  };
}

export const linkToFmSources = (links: LinkInfo[]): FmSrcInfo =>
  links.reduce((srcs, link) => {
    const { book, md5, url, page } = link;
    srcs[book] = { md5, url, page };
    return srcs;
  }, {} as FmSrcInfo);
