import MNComp from "main";
import { NoteImportMode, NoteImportOption, NoteImportStyle } from "modules/handlers/handleNote";
import { PluginSettingTab, App, Setting } from "obsidian";

export interface MNCompSettings {
  noteImportOption: NoteImportOption;
}

export const DEFAULT_SETTINGS: MNCompSettings = {
  noteImportOption: {
    importMode: NoteImportMode.Insert,
    importStyle: NoteImportStyle.Basic,
    blanksAroundSingleLine: false,
    updateH1: false
  }
};

export class MNCompSettingTab extends PluginSettingTab {
  plugin: MNComp;

  constructor(app: App, plugin: MNComp) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {}
}
