import equal from "fast-deep-equal/es6";

import t from "../lang/helper";
import MNComp from "../mn-main";
import { TplCfgTypes } from "../typings/tpl-cfg";

const setInsertData = (plugin: MNComp): void => {
  const { workspace } = plugin.app,
    insertToNote = plugin.mnHandler.insertToNote.bind(plugin.mnHandler),
    checkIsMNData = plugin.inputListener.checkIsMNData.bind(
      plugin.inputListener,
    );

  // setPastedHandler
  plugin.registerEvent(
    workspace.on("editor-paste", (evt, _editor, view) => {
      if (
        // plain text only to avoid breaking html->md
        equal(evt.clipboardData?.types, ["text/plain"]) &&
        checkIsMNData(evt)
      ) {
        evt.preventDefault();
        insertToNote(view);
      }
    }),
  );

  // setInsertCommands
  plugin.addCommand({
    id: "mn-insert2doc",
    name: t("cmd.insert2doc"),
    editorCallback: (_e, view) => insertToNote(view),
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
        editorCallback: (_e, view) =>
          insertToNote(view, { target: type, tplName: name }),
      });
    }
  }
};

export default setInsertData;
