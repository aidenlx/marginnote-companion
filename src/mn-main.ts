import "./main.css";

import { addIcon, MarkdownView, Menu, Plugin } from "obsidian";
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
import icons from "./icons";
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
    icons.forEach((params) => addIcon(...params));

    await this.loadSettings();
    this.addSettingTab(new MNCompSettingTab(this));

    // register mn note handlers
    this.registerCodeMirror((cm) => cm.on("paste", this.PastedNoteHandler));
    this.register(() =>
      this.registerCodeMirror((cm) => cm.off("paste", this.PastedNoteHandler)),
    );
    this.registerEditorMenu();
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

  registerEditorMenu() {
    const onEditorMenu = async (
      menu: Menu,
      _editor: any,
      view: MarkdownView,
    ) => {
      const data = await this.inputListener.readFromInput();

      if (!data) return;
      const templates = this.settings.templates[data.type],
        getClickHandler = (tpl: string) => () =>
          this.mnHandler.insertToNote(view, data, tpl);
      let subMenu = new Menu(this.app),
        hasSub = false;
      for (const [name, tpl] of templates.cfgs) {
        if (tpl.pin) {
          menu.addItem((item) =>
            item
              .setTitle(`${data.type}: ${name}`)
              .setIcon("mn-fill")
              .onClick(getClickHandler(name)),
          );
        } else {
          hasSub || (hasSub = true);
          subMenu.addItem((item) => {
            item.setTitle(`${name}`).onClick(getClickHandler(name));
            item.iconEl.parentElement?.removeChild(item.iconEl);
          });
        }
      }
      if (hasSub)
        menu.addItem((item) =>
          item
            .setTitle(`${data.type}: ...`)
            .setIcon("mn-fill")
            .onClick((evt) => subMenu.showAtMouseEvent(evt)),
        );
    };
    this.registerEvent(this.app.workspace.on("editor-menu", onEditorMenu));
  }
}
