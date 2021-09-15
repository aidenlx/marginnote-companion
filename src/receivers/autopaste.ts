import "./rec-indicator.less";

import { Notice, Platform } from "obsidian";

import t from "../lang/helper";
import MNComp from "../mn-main";

export const setAutoPaste = (plugin: MNComp) => {
  const onToggleAutoPaste = (setTo: boolean) => {
      plugin.inputListener.autoPaste = setTo;
      new Notice("auto paste " + (setTo ? "started" : "stopped"));
    },
    rec = createEl(
      "input",
      { type: "checkbox", cls: "status-bar-item" },
      (el) =>
        el.addEventListener("input", (event) => {
          const input = event.target as HTMLInputElement,
            setTo = input.checked;
          onToggleAutoPaste(setTo);
        }),
    );
  plugin.addCommand({
    id: "mn-autopaste",
    name: t("cmd.auto_paste"),
    callback: () => {
      const setTo = !rec.checked;
      onToggleAutoPaste(setTo);
      rec.checked = setTo;
    },
    hotkeys: [
      {
        modifiers: ["Mod"],
        key: "r",
      },
    ],
  });

  // add clipboard listener callback
  plugin.inputListener.on("changed", (value) => {
    if (!value) return;
    plugin.mnHandler.insertToNote();
  });

  // add button to status bar
  if (Platform.isDesktop) {
    const container = plugin.addStatusBarItem();
    container.addClass("rec");
    container.appendChild(rec);
  }
};
