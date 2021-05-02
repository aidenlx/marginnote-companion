import TurndownService from "turndown";
import json2md, { DataObject } from "json2md";

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
