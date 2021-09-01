import "./main.css";

import { Plugin } from "obsidian";
import { MNCompSettingTab } from "setting-tab";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  MNCompSettings,
  saveSettings,
} from "settings";

import { aliasBelowH1 } from "./controls/alias-below-h1";
import { addSourceButton } from "./controls/source-button";
import MNDataHandler from "./handlers/mn-data-handler";
import i18n from "./lang/helper";
import { MacroHandler, registerMacroCmd } from "./macros/macro-handler";
import { autoPaste } from "./receivers/autopaste";
import InputListener from "./receivers/input-handler";
import { getPastedHandler } from "./receivers/paste-hanlder";

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  inputListener = new InputListener(this.app);
  mnHandler = new MNDataHandler(this);

  PastedNoteHandler = getPastedHandler(this);

  loadSettings = loadSettings.bind(this);
  saveSettings = saveSettings.bind(this);

  t = i18n.t.bind(i18n);

  async onload() {
    console.log("loading marginnote-companion");

    await this.loadSettings();
    this.addSettingTab(new MNCompSettingTab(this));

    // register mn note handlers
    this.registerCodeMirror((cm) => cm.on("paste", this.PastedNoteHandler));
    this.register(() =>
      this.registerCodeMirror((cm) => cm.off("paste", this.PastedNoteHandler)),
    );
    autoPaste(this);
    this.addCommand({
      id: "getMeta",
      name: "get Metadata from MarginNote notes",
      editorCallback: async (_editor, view) => {
        this.mnHandler.importMeta(view);
      },
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
}
