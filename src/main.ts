import { aliasBelowH1 } from "modules/controls/aliasBelowH1";
import { addSourceButton } from "modules/controls/sourceButton";
import { autoPaste } from "modules/receivers/autopaste";
import ClipboardListener from "modules/receivers/cbListener";
import { PastedNoteHandler } from "modules/receivers/pasteEvt";
import { Plugin } from "obsidian";
// import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from 'settings';

export default class MNComp extends Plugin {
  // settings: MNCompSettings = DEFAULT_SETTINGS;

  cbListener = new ClipboardListener();

  async onload() {
    console.log("loading marginnote-companion");

    // await this.loadSettings();

    // this.addSettingTab(new MNCompSettingTab(this.app, this));

    this.registerCodeMirror((cm) => cm.on("paste", PastedNoteHandler));

    addSourceButton(this.app);

    this.registerMarkdownPostProcessor(aliasBelowH1);

    autoPaste(this);
  }

  onunload() {
    console.log("unloading marginnote-companion");

    this.registerCodeMirror((cm) => cm.off("paste", PastedNoteHandler));
  }

  // async loadSettings() {
  // 	this.settings = {...this.settings,...(await this.loadData())};
  // }

  // async saveSettings() {
  // 	await this.saveData(this.settings);
  // }
}
