export default class Link {
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
  static getInst(
    urlOrInfo:
      | { id: string | undefined; linkTo?: "notebook" | "note" }
      | string,
    config?: {
      linktext?: string;
      /** false:  use id (default),
       *  true:   use linktext,
       *  string: use given */
      label?: boolean | string;
    },
    refCallback?: (refSource: string) => any,
  ): Link | undefined {
    return typeof urlOrInfo === "string" || urlOrInfo.id
      ? new Link(urlOrInfo as any, config, refCallback)
      : undefined;
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
