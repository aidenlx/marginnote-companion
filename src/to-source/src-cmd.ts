import { MarkdownView } from "obsidian";

import MNComp from "../mn-main";
import getSrcMenu, { getSourcesFromFile } from "./src-menu";

const addSrcCommand = (plugin: MNComp) => {
  plugin.addCommand({
    id: "open-src",
    name: "Open Source Link",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.getActiveViewOfType(MarkdownView)!,
        sources =
          view instanceof MarkdownView
            ? getSourcesFromFile(view.file, plugin.app)
            : null;
      if (checking) {
        return !!sources;
      } else if (sources) {
        const keys = Object.keys(sources);
        if (Object.keys(sources).length === 1) {
          const entry = sources[keys[0]];
          window.open(typeof entry === "string" ? entry : entry.url);
        } else {
          const { x, y } = view.contentEl.getBoundingClientRect();
          getSrcMenu(sources, plugin.app)?.showAtPosition({ x, y });
        }
      }
    },
  });
};

export default addSrcCommand;
