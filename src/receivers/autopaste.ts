import MNComp from "../mn-main";
import { handleMNData } from "../handlers/handler";
import { InsertTo } from "../cm-tools";
import { Notice, MarkdownView } from "obsidian";

export function autoPaste(plugin: MNComp) {
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
    const activeView = plugin.app.workspace.activeLeaf?.view;
    if (activeView instanceof MarkdownView) {
      const cm = activeView.editor;

      // fallback option if fails
      if (!handleMNData(value, cm, plugin.settings.noteImportOption)) {
        InsertTo(value + "\n", cm, cm.getCursor());
      }
    }
  });
}
