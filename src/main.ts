import { aliasBelowH1 } from "modules/controls/aliasBelowH1";
import { addSourceButton } from "modules/controls/sourceButton";
import { extractLabelFromSel } from "modules/macros/extractLabelFromSel";
import { SelToAilas } from "modules/macros/SelToAilas";
import { autoPaste } from "modules/receivers/autopaste";
import ClipboardListener from "modules/receivers/cbListener";
import { PastedNoteHandler } from "modules/receivers/pasteEvt";
import { MarkdownView, Plugin } from "obsidian";
import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from 'settings';

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  cbListener = new ClipboardListener();

  PastedNoteHandler = PastedNoteHandler.bind(this);

  async onload() {
    console.log("loading marginnote-companion");

    await this.loadSettings();

    this.addSettingTab(new MNCompSettingTab(this.app, this));

    this.registerCodeMirror((cm) => cm.on("paste", this.PastedNoteHandler));

    autoPaste(this);

    // register macros
    this.addCommand({
      id: "autodef",
      name: "Selection to Ailases",
      callback: () => SelToAilas(this.app),
    });
    this.addCommand({
      id: "extractLabelFromSel",
      name: "Extract Label From Selection",
      callback: () => {
        if (this.app.workspace.activeLeaf.view instanceof MarkdownView)
          extractLabelFromSel(this.app.workspace.activeLeaf.view.sourceMode.cmEditor)
      }
    })

    // Enable GUI Modification
    addSourceButton(this.app);
    this.registerMarkdownPostProcessor(aliasBelowH1);
  }

  onunload() {
    console.log("unloading marginnote-companion");

    this.registerCodeMirror((cm) => cm.off("paste", this.PastedNoteHandler));
  }

  async loadSettings() {
  	this.settings = {...this.settings,...(await this.loadData())};
  }

  async saveSettings() {
  	await this.saveData(this.settings);
  }
}
