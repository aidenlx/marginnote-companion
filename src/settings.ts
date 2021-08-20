import MNComp from "mn-main";
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

  display(): void {

    this.containerEl.empty();
    
    const noteImportOption = this.plugin.settings.noteImportOption;

    new Setting(this.containerEl)
    .setName("NoteImportMode")
    .addDropdown((dropdown) => {
      const options: Record<NoteImportMode, string> = {
        0: "Insert",
        1: "Merge",
      };

      dropdown
        .addOptions(options)
        .setValue(noteImportOption.importMode.toString())
        .onChange(async (value) => {
          noteImportOption.importMode = +value;
          await this.plugin.saveSettings();
          this.display();
        });
    });

    new Setting(this.containerEl)
    .setName("NoteImportStyle")
    .addDropdown((dropdown) => {
      const options: Record<NoteImportStyle, string> = {
        0: "Metadata",
        1: "Basic",
        2: "Full"
      };

      dropdown
        .addOptions(options)
        .setValue(noteImportOption.importStyle.toString())
        .onChange(async (value) => {
          noteImportOption.importStyle = +value;
          await this.plugin.saveSettings();
          this.display();
        });
    });

    new Setting(this.containerEl)
      .setName("blanksAroundSingleLine")
      .addToggle((toggle) =>
        toggle
          .setValue(noteImportOption.blanksAroundSingleLine)
          .onChange(async (value) => {
            noteImportOption.blanksAroundSingleLine = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );
    new Setting(this.containerEl)
      .setName("updateH1")
      .addToggle((toggle) =>
        toggle
          .setValue(noteImportOption.updateH1)
          .onChange(async (value) => {
            noteImportOption.updateH1 = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }
}
