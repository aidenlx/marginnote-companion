import { aliasBelowH1 } from "modules/controls/aliasBelowH1";
import { addSourceButton } from "modules/controls/sourceButton";
import { NoteImportMode, NoteImportStyle } from "modules/handlers/handleNote";
import { handleMNData } from "modules/handlers/handler";
import { extractLabelFromSel } from "modules/macros/extractLabelFromSel";
import { SelToAilas } from "modules/macros/SelToAilas";
import { autoPaste } from "modules/receivers/autopaste";
import ClipboardListener from "modules/receivers/cb-listener";
import { cmdPastedNoteHandler } from "modules/receivers/cmd";
import { PastedNoteHandler } from "modules/receivers/paste-hanlder";
import { MarkdownView, Plugin } from "obsidian";
import { MNCompSettings, DEFAULT_SETTINGS, MNCompSettingTab } from "settings";

import "./main.css";

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  cbListener = this.app.isMobile ? null : new ClipboardListener();

  PastedNoteHandler = PastedNoteHandler.bind(this);

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
      callback: () =>
        cmdPastedNoteHandler(this, {
          ...DEFAULT_SETTINGS.noteImportOption,
          importMode: NoteImportMode.Merge,
          importStyle: NoteImportStyle.Metadata,
          updateH1: false,
        }),
    });

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
        if (this.app.workspace.activeLeaf?.view instanceof MarkdownView)
          extractLabelFromSel(
            this.app.workspace.activeLeaf.view.sourceMode.cmEditor,
          );
      },
    });

    // Enable GUI Modification
    addSourceButton(this.app);
    this.registerMarkdownPostProcessor(aliasBelowH1);

    // URL Scheme handlers
    this.registerObsidianProtocolHandler("mncomp", (params) => {
      const macroName = params.macro;
      if (macroName)
        switch (macroName) {
          case "autodef":
            SelToAilas(this.app);
            break;
          default:
            console.error("unsupported macro");
            break;
        }
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
