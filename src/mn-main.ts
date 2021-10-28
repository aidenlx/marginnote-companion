import { addIcon, MarkdownView, Menu, Plugin } from "obsidian";
import { MNCompSettingTab } from "setting-tab";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  MNCompSettings,
  saveSettings,
} from "settings";

import aliasBelowH1 from "./controls/heading-alias";
import MNDataHandler from "./handlers/mn-data-handler";
import icons from "./icons";
import { MacroHandler, registerMacroCmd } from "./macros/macro-handler";
import { setAutoPaste } from "./receivers/autopaste";
import InputListener from "./receivers/input-handler";
import setInsertData from "./receivers/insert";
import setupToSrcTools from "./to-src";
import ExtractHeading from "./toc-tools/extract-heading";
import HideInlineSrc from "./toc-tools/hide-inline-src";
import CopyLinkedToFolder from "./toc-tools/linked2folder";
import Toc2File from "./toc-tools/toc2file";
import Toc2Fm from "./toc-tools/toc2fm";
import Toc2Heading from "./toc-tools/toc2head";

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  inputListener = new InputListener(this);
  mnHandler = new MNDataHandler(this);

  loadSettings = loadSettings.bind(this);
  saveSettings = saveSettings.bind(this);

  async onload() {
    console.log("loading marginnote-companion");
    icons.forEach((params) => addIcon(...params));

    await this.loadSettings();
    this.addSettingTab(new MNCompSettingTab(this));

    // register mn note handlers
    setInsertData(this);

    this.registerEditorMenu();
    setAutoPaste(this);
    this.addCommand({
      id: "getMeta",
      name: "get Metadata from MarginNote notes",
      editorCallback: async (_editor, view) => {
        this.mnHandler.importMeta(view);
      },
    });
    registerMacroCmd.call(this);

    // Enable GUI Modification
    this.registerMarkdownPostProcessor(aliasBelowH1(this));
    setupToSrcTools(this);

    // URL Scheme handlers
    this.registerObsidianProtocolHandler("mncomp", (params) => {
      if (params.macros) MacroHandler.call(this, params);
      else if (params.version)
        this.inputListener.trigger("url-recieved", params);
    });

    // toc tools
    ExtractHeading(this);
    Toc2Fm(this);
    Toc2File(this);
    Toc2Heading(this);
    CopyLinkedToFolder(this);
    HideInlineSrc(this);
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
          this.mnHandler.insertToNote(view, { target: data, tplName: tpl });
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
            .onClick((evt) =>
              evt instanceof MouseEvent
                ? subMenu.showAtMouseEvent(evt)
                : subMenu.showAtPosition(item.iconEl.getBoundingClientRect()),
            ),
        );
    };
    this.registerEvent(this.app.workspace.on("editor-menu", onEditorMenu));
  }
}
