import { htmlToText } from "html-to-text";
import { htmlToMarkdown } from "obsidian";

import MNComp from "../../mn-main";

export default class Text {
  constructor(
    public str: string,
    private plugin: MNComp,
    private html = false,
  ) {}
  static getInst(
    str: string | undefined,
    plugin: MNComp,
    html = false,
  ): Text | undefined {
    return str ? new Text(str, plugin, html) : undefined;
  }

  /** use Plain by default if html */
  get Process(): Text {
    this.str = this.plugin.settings.textPostProcess.reduce(
      (prev, arr) => prev.replace(...arr),
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
