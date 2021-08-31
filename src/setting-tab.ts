import assertNever from "assert-never";
import { cloneDeep } from "lodash-es";
import {
  App,
  debounce,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
} from "obsidian";

import MNComp from "./mn-main";
import { DEFAULT_SETTINGS } from "./settings";
import { TplCfgRecs, TplCfgTypes, TplValue } from "./typings/tpl-cfg";

export class MNCompSettingTab extends PluginSettingTab {
  constructor(private plugin: MNComp) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Templates" });

    this.TplSettings("sel");
    this.TplSettings("note");
    this.TplSettings("toc");
  }

  TplSettings(type: TplCfgTypes): void {
    const { containerEl } = this;

    let heading: string;
    switch (type) {
      case "sel":
        heading = "Selection";
        break;
      case "note":
        heading = "Note";
        break;
      case "toc":
        heading = "Table of Contents";
        break;
      default:
        assertNever(type);
    }
    containerEl.createEl("h3", { text: heading });

    let sectionEl = containerEl.createDiv({ cls: "l1" });

    const tplCfg = this.plugin.settings.templates[type],
      defaultVal = DEFAULT_SETTINGS.templates[type].get("default"),
      elNameMap = new WeakMap<HTMLElement, string>();

    const render = (cfg: TplCfgRecs, name: string) => {
      let entryEl = sectionEl.createDiv({ cls: "l2" }, (el) =>
        elNameMap.set(el, name),
      );
      entryEl.createEl("h4", {}, (el) =>
        new Setting(el).setName("Name").addText((text) => {
          const onChange = async (value: string) => {
            tplCfg.delete(name);
            elNameMap.set(entryEl, value);
            tplCfg.set(value, cfg as any);
            await this.plugin.saveSettings();
          };
          text.setValue(name).onChange(debounce(onChange, 500, true));
        }),
      );

      // remove button
      entryEl.createEl("button", { text: "remove" }, (el) =>
        el.addEventListener("click", (evt) => {
          if (!tplCfg.delete(elNameMap.get(entryEl) ?? "")) {
            console.error(
              "failed to remove %s from %o",
              elNameMap.get(entryEl),
              tplCfg,
            );
          }
          sectionEl.removeChild(entryEl);
        }),
      );
      // read from input button
      entryEl.createEl("button", { text: "preview with input" }, (el) =>
        el.addEventListener("click", async (evt) => {
          const preview = await this.plugin.mnHandler.previewWith(type, name);
          if (preview) new PreviewTpl(this.app, preview).open();
          else if (typeof preview === "string") {
            new Notice("Empty string rendered");
          }
        }),
      );

      for (const [cfgK, cfgVal] of Object.entries(cfg)) {
        const cfgKey = cfgK as keyof typeof cfg;
        if (cfgKey === "templates") {
          for (const [tplKey, v] of Object.entries(cfgVal)) {
            const tplValue = v as TplValue;
            new Setting(entryEl)
              .setName(tplKey + " Template")
              .addTextArea((text) => {
                const onChange = async (value: string) => {
                  cfgVal[tplKey] = value;
                  await this.plugin.saveSettings();
                };
                text.setValue(tplValue).onChange(debounce(onChange, 500, true));
                text.inputEl.rows = 8;
                text.inputEl.cols = 30;
              });
          }
        } else if (typeof cfgVal === "boolean") {
          new Setting(entryEl).setName(cfgKey).addToggle((toggle) =>
            toggle.setValue(cfgVal).onChange(async (value) => {
              cfg[cfgKey] = value;
              await this.plugin.saveSettings();
            }),
          );
        } else {
          console.error(
            "Unable to render template extra param %s: %o",
            cfgK,
            cfgVal,
          );
        }
      }
    };
    tplCfg.forEach(render as any);

    // add new button
    containerEl.createEl("button", { text: "add" }, (el) =>
      el.addEventListener("click", (evt) => {
        const name = Date.now().toString(),
          cfg = cloneDeep(defaultVal) as any;
        tplCfg.set(name, cfg);
        render(cfg, name);
      }),
    );
  }
}

class PreviewTpl extends Modal {
  constructor(app: App, public md: string) {
    super(app);
  }
  onOpen() {
    this.contentEl.setText(this.md);
  }
  onClose() {
    this.contentEl.empty();
  }
}
