import "setting-tab.css";

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

import { TFunction } from "./lang/helper";
import { filterKeyWithType, strToFragment } from "./misc";
import MNComp from "./mn-main";
import { DEFAULT_SETTINGS } from "./settings";
import { NoteViewKeys } from "./template/note-template";
import { SelViewKeys } from "./template/sel-template";
import { TocViewKeys } from "./template/toc-template";
import { Templates, TplCfgRecs, TplCfgTypes } from "./typings/tpl-cfg";

export class MNCompSettingTab extends PluginSettingTab {
  constructor(public plugin: MNComp) {
    super(plugin.app, plugin);
  }

  t = this.plugin.t;

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    this.containerEl.toggleClass("mn-settings", true);

    const tplHeading = containerEl.createEl("h2", {
      text: this.t("settings.tpl_cfg.heading"),
    });

    const types = ["sel", "note", "toc"] as const,
      anchors = types.map((t) => {
        const [id, heading] = this.TplSettings(t);
        return createEl("li", {}, (el) =>
          el.appendChild(createEl("a", { href: "#" + id, text: heading })),
        );
      });
    console.log(anchors);
    tplHeading.insertAdjacentElement(
      "afterend",
      createEl("ul", { cls: "horizontal-list" }, (el) =>
        anchors.forEach((a) => el.appendChild(a)),
      ),
    );
  }

  TplSettings(type: TplCfgTypes): [id: string, heading: string] {
    const { containerEl } = this,
      { cfgs: nameTplMap } = this.plugin.settings.templates[type],
      defaultVal = DEFAULT_SETTINGS.templates[type].cfgs.get("default"),
      elNameMap = new WeakMap<HTMLElement, string>();

    const sectionEl = containerEl.createDiv({
      cls: "section",
      attr: { id: "mn-tpls-" + type },
    });
    const heading = ((type: TplCfgTypes) => {
      const base = "settings.tpl_cfg.headings." as const,
        path = (base + type) as `${typeof base}${typeof type}`;
      return this.t(path);
    })(type);

    // Heading
    new Setting(sectionEl)
      .addButton((b) =>
        // add new button
        b
          .setIcon("plus-with-circle")
          .setTooltip(this.t("settings.tpl_cfg.tooltips.add_new"))
          .onClick(async () => {
            const name = Date.now().toString(),
              cfg = cloneDeep(defaultVal) as any;
            nameTplMap.set(name, cfg);
            render(cfg, name).scrollIntoView();
            await this.plugin.saveSettings();
          }),
      )
      .then((s) => s.nameEl.createEl("h3", { text: heading }));

    // Select Default Template
    new Setting(sectionEl)
      .setName(this.t("settings.tpl_cfg.default_tpl_name"))
      .setDesc(this.t("settings.tpl_cfg.default_tpl_desc"))
      .addDropdown((dropdown) => {
        const options = [...nameTplMap.keys()].reduce(
          (obj, name) => ((obj[name] = name), obj),
          {} as Record<string, string>,
        );
        dropdown
          .addOptions(options)
          .setValue(this.plugin.settings.templates[type].defaultTpl)
          .onChange(async (value) => {
            this.plugin.settings.templates[type].defaultTpl = value;
            await this.plugin.saveSettings();
          });
      });

    // Template Configs
    const render = (cfg: TplCfgRecs, name: string): HTMLElement => {
      let entryEl = sectionEl.createEl(
        "details",
        { cls: ["tpl-entry"] },
        (el) => elNameMap.set(el, name),
      );

      const buttonRemove = (setting: Setting) => {
          const handleClick = () => {
            if (!nameTplMap.delete(elNameMap.get(entryEl) ?? "")) {
              console.error(
                "failed to remove %s from %o",
                elNameMap.get(entryEl),
                nameTplMap,
              );
            }
            sectionEl.removeChild(entryEl);
          };
          setting.addButton((b) =>
            // remove button
            b
              .setClass("mod-warning")
              .setIcon("trash")
              .setTooltip(this.t("settings.tpl_cfg.tooltips.remove"))
              .onClick(handleClick),
          );
        },
        buttonPreview = (setting: Setting) => {
          const handleClick = async () => {
            const preview = await this.plugin.mnHandler.previewWith(type, name);
            if (preview) new PreviewTpl(this.app, preview).open();
            else if (typeof preview === "string") {
              new Notice("Empty string rendered");
            }
          };
          setting.addButton((b) =>
            // remove button
            b
              .setIcon("popup-open")
              .setTooltip(this.t("settings.tpl_cfg.tooltips.preview"))
              .onClick(handleClick),
          );
        },
        isDefault = name === "default";

      // Name El
      new Setting(entryEl.createEl("summary", { cls: "tpl-name" })).then(
        (s) => {
          const tooltip = this.t("settings.tpl_cfg.tooltips.tpl_name");
          if (isDefault) {
            s.setName(name);
            s.setTooltip(tooltip);
          } else {
            s.settingEl.addClass("canwarp");
            s.infoEl.createEl(
              "input",
              {
                type: "text",
                attr: { spellcheck: false, "aria-label": tooltip },
              },
              (el) => {
                const onChange = async (ev: Event) => {
                  const value = (ev.target as HTMLInputElement).value;
                  nameTplMap.delete(name);
                  elNameMap.set(entryEl, value);
                  nameTplMap.set(value, cfg as any);
                  await this.plugin.saveSettings();
                };
                el.value = name;
                el.addEventListener("change", debounce(onChange, 500, true));
              },
            );
            buttonRemove(s);
          }
          buttonPreview(s);
        },
      );

      let toggleKeys = [] as filterKeyWithType<typeof cfg, boolean>[];
      for (const [cfgK, cfgVal] of Object.entries(cfg)) {
        const cfgKey = cfgK as keyof typeof cfg;
        if (cfgKey === "templates") {
          switch (type) {
            case "sel":
              setTemplates(cfgVal, entryEl, this, setSel);
              break;
            case "note":
              setTemplates(cfgVal, entryEl, this, setNote);
              break;
            case "toc":
              setTemplates(cfgVal, entryEl, this, setToc);
              break;
            default:
              assertNever(type);
          }
        } else if (typeof cfgVal === "boolean") {
          toggleKeys.push(cfgK);
        } else {
          console.error(
            "Unable to render template extra param %s: %o",
            cfgK,
            cfgVal,
          );
        }
      }
      toggleKeys.length > 0 &&
        toggleKeys.sort().forEach((key) => {
          const getName = () => {
            const base = `settings.tpl_cfg.toggles_name.` as const,
              path = (base + key) as `${typeof base}${typeof key}`;
            return this.t(path);
          };
          const getDesc = () => {
            const base = `settings.tpl_cfg.toggles_desc.` as const,
              path = (base + key) as `${typeof base}${typeof key}`;
            return strToFragment(this.t(path));
          };
          new Setting(entryEl)
            .setName(getName())
            .setDesc(getDesc())
            .addToggle((toggle) =>
              toggle.setValue(cfg[key]).onChange(async (value) => {
                cfg[key] = value;
                await this.plugin.saveSettings();
              }),
            );
        });
      return entryEl;
    };
    nameTplMap.forEach(render as any);
    return [sectionEl.id, heading];
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

type setNameDescFunc<T extends TplCfgTypes> = (
  key: keyof Templates<T>,
  t: TFunction,
) => [name: string, desc: string];
const setTemplates = <T extends TplCfgTypes>(
  templates: Templates<T>,
  target: HTMLElement,
  st: MNCompSettingTab,
  setNameDesc: setNameDescFunc<T>,
) => {
  for (const k of Object.keys(templates)) {
    const key = k as keyof typeof templates;
    let setting = new Setting(target).addTextArea((text) => {
      const onChange = async (value: string) => {
        templates[key] = value;
        await st.plugin.saveSettings();
      };
      text.setValue(templates[key]).onChange(debounce(onChange, 500, true));
      text.inputEl.cols = 30;
      text.inputEl.rows = 5;
    });
    const [name, desc] = setNameDesc(key, st.plugin.t);
    setting.setName(name).setDesc(strToFragment(desc));
  }
};

const setNote: setNameDescFunc<"note"> = (key, t) => {
  const getPlaceholders = (t: typeof key) =>
    NoteViewKeys[t].map((v) => `{{${v}}}`).join(", ");

  switch (key) {
    case "body":
      return [
        t("settings.tpl_cfg.templates_name.note_body"),
        t("settings.tpl_cfg.templates_desc.note_body", {
          cmt_ph: "{{> Comments}}",
          phs: getPlaceholders(key),
        }),
      ];
    case "comment":
      return [
        t("settings.tpl_cfg.templates_name.note_comment"),
        t("settings.tpl_cfg.templates_desc.note_comment", {
          phs: getPlaceholders(key),
        }),
      ];
    case "cmt_linked":
      return [
        t("settings.tpl_cfg.templates_name.note_cmt_linked"),
        t("settings.tpl_cfg.templates_desc.note_cmt_linked", {
          phs: getPlaceholders(key),
        }),
      ];
    default:
      assertNever(key);
  }
};

const setSel: setNameDescFunc<"sel"> = (key, t) => {
  switch (key) {
    case "sel":
      return [
        t("settings.tpl_cfg.templates_name.sel"),
        t("settings.tpl_cfg.templates_desc.sel", {
          phs: SelViewKeys.map((v) => `{{${v}}}`).join(", "),
        }),
      ];
    default:
      assertNever(key);
  }
};

const setToc: setNameDescFunc<"toc"> = (key, t) => {
  switch (key) {
    case "item":
      return [
        t("settings.tpl_cfg.templates_name.toc_item"),
        t("settings.tpl_cfg.templates_desc.toc_item", {
          phs: TocViewKeys.map((v) => `{{${v}}}`).join(", "),
        }),
      ];
    default:
      assertNever(key);
  }
};
