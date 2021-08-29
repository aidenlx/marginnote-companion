import { MarkdownView, Notice } from "obsidian";

import { InsertTo } from "../cm-tools";
import MNComp from "../mn-main";

export const autoPaste = (plugin: MNComp) => {
  const onToggleAutoPaste = (setTo: boolean) => {
      plugin.inputListener.autoPaste = setTo;
      new Notice("auto paste " + (setTo ? "started" : "stopped"));
    },
    rec = createEl(
      "input",
      {
        type: "checkbox",
        cls: "rec status-bar-item",
      },
      (el) =>
        el.addEventListener("input", (event) => {
          const input = event.target as HTMLInputElement,
            setTo = input.checked;
          onToggleAutoPaste(setTo);
        }),
    );
  plugin.addCommand({
    id: "rec",
    name: "Auto Paste to Active Editor",
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

  // add button to status bar
  const container = plugin.addStatusBarItem();
  container.addClass("rec-container");
  container.appendChild(rec);

  // add clipboard listener callback
  plugin.inputListener.on("changed", (value) => {
    if (!value) return;
    plugin.mnHandler.insertToNote();
  });
};
