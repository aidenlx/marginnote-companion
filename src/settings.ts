import { App, PluginSettingTab, Setting } from "obsidian";

import MNComp from "./mn-main";

export interface MNCompSettings {
  textPostProcess: [search: string, searchFlags: string, replace: string][];
  defaultDateFormat: string;
  templates: {
    selection: string;
    note: {
      body: string;
      comment: string;
      cmt_linked: string;
    };
    tocItem: string;
  };
  /** md5->path */
  videoMap: Record<string, { srcName: string; mapTo: string }>;
}

export const DEFAULT_SETTINGS: MNCompSettings = {
  defaultDateFormat: "YY-MM-DD HH:mm",
  textPostProcess: [
    [/ {2,}/g, " "],
    [/(\d+?\.(?![\d]).+?) +?/g, "$1："],
    [/^[;,. ]+|[;,. ]+$|\B | \B/g, ""],
    [/;/g, "；"],
    [/,/g, "，"],
    [/([A-Za-z0-9])\s{0,}，\s{0,}(?=[A-Za-z0-9])/g, "$1,"],
    [/:/g, "："],
    [/〜/g, "~"],
    [/[“”„‟〝〞〟＂]/g, '"'],
  ].reduce((prev, arr) => {
    const regex = arr[0] as RegExp,
      replace = arr[1] as string;
    prev.push([regex.source, regex.flags, replace]);
    return prev;
  }, [] as MNCompSettings["textPostProcess"]),
  templates: {
    selection: "{{SELECTION}}",
    note: {
      body: "\n{{#Title}}\n## {{.}}\n\n{{/Title}}{{Excerpt}}{{Link}}{{> CmtBreak}}{{> Comments}}\n",
      comment: "> - {{.}}\n",
      cmt_linked: "> - {{Excerpt}}{{Link}}\n",
    },
    tocItem: `- {{Title}} [{{DocTitle}}]({{Link.Url}} "#{{#Page}}{{.}}&{{/Page}}{{#DocMd5}}md5={{.}}{{/DocMd5}}")`,
  },
  videoMap: {},
};

const toStrArr = (
  search: RegExp,
  replace: string,
): [search: string, searchFlags: string, replace: string] => [
  search.source,
  search.flags,
  replace,
];

export class MNCompSettingTab extends PluginSettingTab {
  plugin: MNComp;

  constructor(app: App, plugin: MNComp) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    // new Setting(this.containerEl)
    //   .setName("NoteImportMode")
    //   .addDropdown((dropdown) => {
    //     const options: Record<NoteImportMode, string> = {
    //       0: "Insert",
    //       1: "Merge",
    //     };

    //     dropdown
    //       .addOptions(options)
    //       .setValue(noteImportOption.importMode.toString())
    //       .onChange(async (value) => {
    //         noteImportOption.importMode = +value;
    //         await this.plugin.saveSettings();
    //         this.display();
    //       });
    //   });

    // new Setting(this.containerEl)
    //   .setName("NoteImportStyle")
    //   .addDropdown((dropdown) => {
    //     const options: Record<NoteImportStyle, string> = {
    //       0: "Metadata",
    //       1: "Basic",
    //       2: "Full",
    //     };

    //     dropdown
    //       .addOptions(options)
    //       .setValue(noteImportOption.importStyle.toString())
    //       .onChange(async (value) => {
    //         noteImportOption.importStyle = +value;
    //         await this.plugin.saveSettings();
    //         this.display();
    //       });
    //   });

    // new Setting(this.containerEl)
    //   .setName("blanksAroundSingleLine")
    //   .addToggle((toggle) =>
    //     toggle
    //       .setValue(noteImportOption.blanksAroundSingleLine)
    //       .onChange(async (value) => {
    //         noteImportOption.blanksAroundSingleLine = value;
    //         await this.plugin.saveSettings();
    //         this.display();
    //       }),
    //   );
    // new Setting(this.containerEl).setName("updateH1").addToggle((toggle) =>
    //   toggle.setValue(noteImportOption.updateH1).onChange(async (value) => {
    //     noteImportOption.updateH1 = value;
    //     await this.plugin.saveSettings();
    //     this.display();
    //   }),
    // );
  }
}
