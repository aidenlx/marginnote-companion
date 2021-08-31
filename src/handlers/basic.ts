import { excerptPic, excerptPic_video } from "@alx-plugins/marginnote";
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
  urlOrInfo: { id: string | undefined; linkTo?: "notebook" | "note" } | string,
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
  private _mnUrl: { id: string; linkTo: "notebook" | "note" } | string;
  constructor(
    mnUrl: { id: string; linkTo?: "notebook" | "note" } | string,
    private config?: {
      linktext?: string;
      /** false:  use id (default),
       *  true:   use linktext,
       *  string: use given */
      label?: boolean | string;
    },
    private refCallback?: (refSource: string) => any,
  ) {
    if (typeof mnUrl !== "string") mnUrl.linkTo = mnUrl.linkTo ?? "note";
    this._mnUrl = mnUrl as Link["_mnUrl"];
  }

  private get linktext(): string {
    return this.config?.linktext ?? "";
  }
  private get label(): string {
    const label = this.config?.label,
      fallback = () => this.Url.slice(-6);
    // [link_text][] = [link_text][link_text]
    if (label === true) return this.linktext ? "" : fallback();
    else return label ? label : fallback();
  }

  get Url(): string {
    return typeof this._mnUrl === "string"
      ? this._mnUrl
      : Link.getUrl(this._mnUrl.id, this._mnUrl.linkTo);
  }
  get Bare(): string {
    return `<${this.Url}>`;
  }
  get Inline(): string {
    return `[${this.linktext}](${this.Url})`;
  }
  get Ref(): string {
    return this.RefMark;
  }
  private get RefMark(): string {
    this.refCallback && this.refCallback(this.refSource);
    return `[${this.linktext}][${this.label}]`;
  }
  private get refSource(): string {
    return `[${this.label}]: ${this.Url}`;
  }
  toString() {
    return this.Inline;
  }

  static getToInsertLast(target: string, refSource: string) {
    let count = target.match(/\n*$/)?.first()?.length ?? 0;
    return "\n".repeat(count >= 2 ? 0 : 2 - count) + refSource + "\n";
  }
  static getUrl(id: string, linkTo: "notebook" | "note" = "note") {
    return `marginnote3app://${linkTo}/${id}`;
  }
}

export class Excerpt {
  constructor(
    private textFirst: boolean,
    public Text: Text | undefined,
    public Pic: string | undefined,
  ) {}

  /** use processed text */
  get Process(): Excerpt {
    this.Text && this.Text.Process;
    return this;
  }
  get PicFirst(): Excerpt {
    this.textFirst = false;
    return this;
  }
  /** textFirst = true */
  get TextFirst(): Excerpt {
    this.textFirst = true;
    return this;
  }
  toString(): string {
    if (!this.Text && !this.Pic) return "";

    return (
      (this.textFirst ? this.Text ?? this.Pic : this.Pic ?? this.Text) as
        | Text
        | string
    ).toString();
  }
}

export class Comment {
  private srcLink: Link | undefined = undefined;
  constructor(
    private content: Text | string | Link | undefined,
    srcNoteId?: string,
  ) {
    if (srcNoteId) this.srcLink = getLink({ id: srcNoteId });
  }

  get isRegular(): true {
    return true;
  }
  get Process() {
    if (this.content instanceof Text) this.content.Process;
    return this.content;
  }
  get Text(): Text | undefined {
    return this.content instanceof Text ? this.content : undefined;
  }
  get Link(): Link | undefined {
    return this.content instanceof Link ? this.content : undefined;
  }
  get Media(): string | undefined {
    return typeof this.content === "string" ? this.content : undefined;
  }
  get SrcLink(): Link | undefined {
    return (
      this.srcLink ?? (this.content instanceof Link ? this.content : undefined)
    );
  }

  toString(): string {
    return this.content?.toString() ?? "";
  }
}
