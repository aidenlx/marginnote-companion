import { ReturnBody } from "@aidenlx/obsidian-bridge";
import equal from "fast-deep-equal/es6";
import { Editor, MarkdownView } from "obsidian";

import t from "../lang/helper";
import MNComp from "../mn-main";
import { TplCfgTypes } from "../typings/tpl-cfg";

export const getPastedHandler =
  (plugin: MNComp) =>
  async (
    e: ClipboardEvent & { mnHandled?: any },
    _editor: Editor,
    view: MarkdownView,
  ) => {
    if (
      e.mnHandled !== true &&
      e.target &&
      // plain text only to avoid breaking html->md
      equal(e.clipboardData?.types, ["text/plain"])
    ) {
      const target = e.target,
        noDataCallback = () => {
          let newEvt = new ClipboardEvent("paste", {
            clipboardData: e.clipboardData,
          }) as typeof e;
          newEvt.mnHandled = true;
          target.dispatchEvent(newEvt);
        };
      e.preventDefault();
      await insert(plugin, noDataCallback, view);
    }
  };

const insert = (
  plugin: MNComp,
  noDataCallback?: () => void,
  view?: MarkdownView,
  tpl?: {
    target: TplCfgTypes | ReturnBody;
    tplName: string;
  },
) =>
  plugin.mnHandler.insertToNote(view, tpl, {
    NoMNData: noDataCallback,
  });

export const setInsertCommands = (plugin: MNComp) => {
  plugin.addCommand({
    id: "mn-insert2doc",
    name: t("cmd.insert2doc"),
    editorCallback: async () => insert(plugin),
  });
  const { templates } = plugin.settings;
  for (const key of Object.keys(templates)) {
    const type = <TplCfgTypes>key;
    for (const [name, cfg] of templates[type].cfgs.entries()) {
      if (!cfg.cmd) continue;
      plugin.addCommand({
        id: `mn-insert2doc-${type}-${name}`,
        name: t("cmd.insert2doc_tpl", {
          tplName: name,
          data_type: t(`settings.tpl_cfg.headings.${type}`),
        }),
        editorCallback: async (_e, view) =>
          insert(plugin, undefined, view, { target: type, tplName: name }),
      });
    }
  }
};
