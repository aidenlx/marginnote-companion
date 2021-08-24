import { aliasBelowH1 } from "modules/controls/aliasBelowH1";
import { addSourceButton } from "modules/controls/sourceButton";
import { NoteImportMode, NoteImportStyle } from "modules/handlers/handleNote";
import { autoPaste } from "modules/receivers/autopaste";
import {
  getPastedHandler,
  getCmdPasteHandler,
} from "modules/receivers/paste-hanlder";
import { Plugin } from "obsidian";
import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from "settings";

import "./main.css";
import { MacroHandler, registerMacroCmd } from "./modules/macros/macro-handler";
import InputListener from "./modules/receivers/input-handler";

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  inputListener = new InputListener(this.app);

  PastedNoteHandler = getPastedHandler(this);

  async onload() {
    console.log("loading marginnote-companion");

    await this.loadSettings();
    this.addSettingTab(new MNCompSettingTab(this.app, this));

    // register mn note handlers
    this.registerCodeMirror((cm) => cm.on("paste", this.PastedNoteHandler));
    autoPaste(this);
    this.addCommand({
      id: "getMeta",
      name: "get Metadata from MarginNote notes",
      editorCallback: getCmdPasteHandler({
        ...DEFAULT_SETTINGS.noteImportOption,
        importMode: NoteImportMode.Merge,
        importStyle: NoteImportStyle.Metadata,
        updateH1: false,
      }),
    });
    registerMacroCmd.call(this);

    // Enable GUI Modification
    addSourceButton(this.app);
    this.registerMarkdownPostProcessor(aliasBelowH1);

    // URL Scheme handlers
    this.registerObsidianProtocolHandler("mncomp", (params) => {
      if (params.macros) MacroHandler.call(this, params);
      else if (params.version)
        this.inputListener.trigger("url-recieved", params);
    });
  }

  onunload() {
    console.log("unloading marginnote-companion");

    this.registerCodeMirror((cm) => cm.off("paste", this.PastedNoteHandler));
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
