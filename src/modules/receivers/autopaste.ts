import MNComp from "mn-main";
import { handleMNData } from "../handlers/handler";
import { InsertTo } from "modules/cm-tools";
import { Notice, MarkdownView } from "obsidian";

function addRecButton(rec: HTMLInputElement, plugin: MNComp) {
  rec.addEventListener("input", (event) => {
    let input = event.target as HTMLInputElement,
      watching: boolean;

    if (plugin.cbListener) {
      const setTo = input.checked;
      plugin.cbListener.Watching = setTo;
      watching = setTo;
    } else {
      throw new Error("Not Implemented");
    }
    new Notice("auto paste " + (watching ? "started" : "stopped"));
  });
  setTimeout(() => {
    const container = plugin.addStatusBarItem();
    container.addClass("rec-container");
    container.appendChild(rec);
  }, 500);
}

const recCommandCallback = (rec: HTMLInputElement, plugin: MNComp) => () => {
  let watching: boolean;
  if (plugin.cbListener) {
    const setTo = !rec.checked;
    plugin.cbListener.Watching = setTo;
    rec.checked = setTo;
    watching = setTo;
  } else {
    throw new Error("Not Implemented");
  }
  new Notice("auto paste " + (watching ? "started" : "stopped"));
};

export function autoPaste(plugin: MNComp) {
  const rec = createEl("input", {
    type: "checkbox",
    cls: "rec status-bar-item",
  });

  if (plugin.cbListener) {
    // add clipboard listener callback
    plugin.cbListener.on("changed", (value) => {
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
  } else {
    throw new Error("Not Implemented");
  }

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
