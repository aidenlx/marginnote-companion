import "./main.css";

import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MNCompSettings, MNCompSettingTab } from "settings";

import { aliasBelowH1 } from "./controls/alias-below-h1";
import { addSourceButton } from "./controls/source-button";
import { NoteImportMode, NoteImportStyle } from "./handlers/handle-note";
import { MacroHandler, registerMacroCmd } from "./macros/macro-handler";
import { autoPaste } from "./receivers/autopaste";
import InputListener from "./receivers/input-handler";
import {
  getCmdPasteHandler,
  getPastedHandler,
} from "./receivers/paste-hanlder";

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
