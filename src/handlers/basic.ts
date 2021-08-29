import { htmlToText } from "html-to-text";
import { htmlToMarkdown } from "obsidian";

import MNComp from "../mn-main";

export const getText = (
  str: string | undefined,
  plugin: MNComp,
  html = false,
): Text | undefined => (str ? new Text(str, plugin, html) : undefined);
export class Text {
  constructor(
    public str: string,
    private plugin: MNComp,
    private html = false,
  ) {}

  /** use Plain by default if html */
  get Process(): Text {
    this.str = this.plugin.settings.textPostProcess.reduce(
      (prev, arr) => prev.replace(...toParams(arr)),
      this.html ? htmlToText(this.str) : this.str,
    );
    return this;
  }
  get Plain(): Text {
    if (this.html) {
      this.str = htmlToText(this.str);
      this.html = false;
    }
    return this;
  }
  get Full(): Text {
    if (this.html) {
      this.str = htmlToMarkdown(this.str);
      this.html = false;
    }
    return this;
  }
  toString() {
    if (this.html) return htmlToMarkdown(this.str);
    else return this.str;
  }
}

const toParams = ([search, searchFlags, replace]: [
  search: string,
  searchFlags: string,
  replace: string,
]): [search: RegExp, replace: string] => [
  new RegExp(search, searchFlags),
  replace,
];

export const getLink = (
  urlOrInfo: { id: string | undefined; linkTo: "notebook" | "note" } | string,
  config?: {
    linktext?: string;
    /** false:  use id (default),
     *  true:   use linktext,
     *  string: use given */
    label?: boolean | string;
  },
  refCallback?: (refSource: string) => any,
): Link | undefined =>
  typeof urlOrInfo === "string" || urlOrInfo.id
    ? new Link(urlOrInfo as any, config, refCallback)
    : undefined;

export class Link {
  constructor(
    private _mnUrl: { id: string; linkTo: "notebook" | "note" } | string,
    private config?: {
      linktext?: string;
      /** false:  use id (default),
       *  true:   use linktext,
       *  string: use given */
      label?: boolean | string;
    },
    private refCallback?: (refSource: string) => any,
  ) {}

  private get mnUrl(): string {
    return typeof this._mnUrl === "string"
      ? this._mnUrl
      : `marginnote3app://${this._mnUrl.linkTo}/${this._mnUrl.id}`;
  }
  private get linktext(): string {
    return this.config?.linktext ?? "";
  }
  private get label(): string {
    const label = this.config?.label,
      fallback = () => this.mnUrl.slice(-6);
    // [link_text][] = [link_text][link_text]
    if (label === true) return this.linktext ? "" : fallback();
    else return label ? label : fallback();
  }
  get Bare(): string {
    return `<${this.mnUrl}>`;
  }
  get Inline(): string {
    return `[${this.linktext}](${this.mnUrl})`;
  }
  get Ref(): string {
    return this.RefMark;
  }
  private get RefMark(): string {
    this.refCallback && this.refCallback(this.refSource);
    return `[${this.linktext}][${this.label}]`;
  }
  private get refSource(): string {
    return `[${this.label}]: ${this.mnUrl}`;
  }
  toString() {
    return this.Inline;
  }

  static getToInsertLast(target: string, refSource: string) {
    let count = target.match(/\n*$/)?.first()?.length ?? 0;
    return "\n".repeat(count >= 2 ? 0 : 2 - count) + refSource + "\n";
  }
}
