import { ReturnBody } from "@aidenlx/obsidian-bridge";
import equal from "fast-deep-equal/es6";
import { MarkdownView } from "obsidian";

import t from "../lang/helper";
import MNComp from "../mn-main";
import { TplCfgTypes } from "../typings/tpl-cfg";

export const getPastedHandler =
  (plugin: MNComp) => async (cm: CodeMirror.Editor, e: ClipboardEvent) => {
    if (
      e.cancelable &&
      e.target &&
      // plain text only to avoid breaking html->md
      equal(e.clipboardData?.types, ["text/plain"])
    ) {
      const target = e.target,
        noDataCallback = () =>
          target.dispatchEvent(
            new ClipboardEvent("paste", {
              clipboardData: e.clipboardData,
              cancelable: false,
            }),
          );
      e.preventDefault();
      await insert(plugin, noDataCallback);
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
