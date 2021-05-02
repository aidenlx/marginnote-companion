import assertNever from "assert-never";
import { mnUrl } from "modules/misc";

/**
 *
 * @param id note id
 * @param lt \[linktext\](url...)
 * @returns
 */
export function getAnchor(type: MDLinkType, id: string, lt?: string): string {
  switch (type) {
    case MDLinkType.Bare:
      return `<${mnUrl("note", id)}>`;
    case MDLinkType.Inline:
      return MDLink.getInline(mnUrl("note", id), lt);
    case MDLinkType.Ref:
      return MDLink.getRefMark(lt ?? "", id.slice(-6));
    default:
      assertNever(type);
  }
}

export class MDLink {
  url: string;
  /** \[\](... "title")*/
  title?: string;
  label?: string;
  /** \[link_text\](...)*/
  link_text?: string;

  private _type: MDLinkType;

  public get type() {
    return this._type;
  }
  setType(type: MDLinkType, label?: string) {
    if (type === MDLinkType.Ref) {
      this.label = label === undefined ? makeid(6) : label;
    }
    this._type = type;
  }

  /**
   *
   * @param url
   * @param link_text \[link_text\](...)
   * @param title \[\](... "title")
   * @param label 未提供则生成随机label
   */
  constructor(url: string, link_text?: string, title?: string, label?: string) {
    this.url = url;
    this.title = title;
    this.link_text = link_text;
    this.label = label ?? makeid(6);

    if (label !== undefined) {
      this._type = MDLinkType.Ref;
    } else if (link_text === undefined && title === undefined) {
      this._type = MDLinkType.Bare;
    } else {
      this._type = MDLinkType.Inline;
    }
  }

  toString() {
    let { url, title, link_text } = this;

    switch (this.type) {
      case MDLinkType.Bare:
        return `<${url}>`;
      case MDLinkType.Ref:
        return `${this.refMark}\n\n${this.refSource}`;
      case MDLinkType.Inline:
        return MDLink.getInline(url, link_text, title);
      default:
        assertNever(this.type);
    }
  }

  /**
   *
   * @param label 若与link_text相同，则返回值省略label
   * @returns
   */
  static getRefMark(link_text: string, label: string): string {
    // 包含[abc][]\n\n[abc]: ...
    return `[${link_text}][${label === link_text ? "" : label}]`;
  }
  public get refMark(): string | undefined {
    if (this.type === MDLinkType.Ref) {
      return MDLink.getRefMark(this.link_text ?? "", this.label as string);
    } else {
      return undefined;
    }
  }

  static getRefSource(url: string, label: string, title?: string) {
    title = titleProcess(title);
    return `[${label}]: ${url + title}`;
  }
  public get refSource(): string | undefined {
    if (this.type === MDLinkType.Ref) {
      return MDLink.getRefSource(this.url, this.label as string, this.title);
    } else {
      return undefined;
    }
  }

  static getInline(url: string, link_text?: string, title?: string) {
    link_text = linktProcess(link_text);
    title = titleProcess(title);
    return `[${link_text}](${url + title})`;
  }
}

const linktProcess = (lt: string | undefined) => lt ?? "";
const titleProcess = (t: string | undefined) =>
  t === undefined ? "" : ` "${t}"`;

export enum MDLinkType {
  /**<url> */
  Bare = "bare",
  /**[](url) */
  Inline = "inline",
  /**[][^label] [^label]: url */
  Ref = "ref",
}

function makeid(length: number) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
