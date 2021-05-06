import MNComp from "main";
import { handleMNData } from "../handlers/handler";
import { InsertTo } from "modules/cm-tools";
import { Notice, MarkdownView } from "obsidian";

function addRecButton(rec: HTMLInputElement, plugin: MNComp) {
  rec.addEventListener("input", (event) => {
    let input = event.target as HTMLInputElement;
    plugin.cbListener.Watching = input.checked;
    let state = plugin.cbListener.Watching ? "started" : "stopped";
    new Notice("auto paste " + state);
  });
  setTimeout(() => {
    const container = plugin.addStatusBarItem();
    container.addClass("rec-container");
    container.appendChild(rec);
  }, 500);
}

const recCommandCallback = (rec: HTMLInputElement, plugin: MNComp) => () => {
  plugin.cbListener.Watching = !rec.checked;
  rec.checked = plugin.cbListener.Watching;
  let state = plugin.cbListener.Watching ? "started" : "stopped";
  new Notice("auto paste " + state);
};

export function autoPaste(plugin: MNComp) {
  const rec = createEl("input", {
    type: "checkbox",
    cls: "rec status-bar-item",
  });

  // add clipboard listener callback
  plugin.cbListener.listener = (value) => {
    if (!value) return;
    const activeView = plugin.app.workspace.activeLeaf.view;
    if (activeView instanceof MarkdownView) {
      const cm = activeView.editor;

      // fallback option if fails
      if (!handleMNData(value, cm, plugin.settings.noteImportOption)) {
        InsertTo(value + "\n", cm, cm.getCursor());
      }
    }
  };

  addRecButton(rec, plugin);

  plugin.addCommand({
    id: "rec",
    name: "Auto Paste to Active Editor",
    callback: recCommandCallback(rec, plugin),
    hotkeys: [
      {
        modifiers: ["Mod"],
        key: "r",
      },
    ],
  });
}
