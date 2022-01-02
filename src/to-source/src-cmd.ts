import { MarkdownView } from "obsidian";

import MNComp from "../mn-main";
import getSrcMenu, { isObjSrc } from "./src-menu";

const getViewSrc = (plugin: MNComp) => {
  const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
  let sources;
  if (
    view &&
    (sources = plugin.app.metadataCache.getFileCache(view.file)?.frontmatter
      ?.sources)
  ) {
    return { view, sources };
  }
  return null;
};

const addSrcCommand = (plugin: MNComp) => {
  plugin.addCommand({
    id: "open-src",
    name: "Open Source Link",
    checkCallback: (checking) => {
      const viewSrc = getViewSrc(plugin);
      if (checking) {
        return !!(viewSrc && isObjSrc(viewSrc.sources));
      } else if (viewSrc) {
        const { view, sources } = viewSrc;
        if (isObjSrc(sources)) {
          const keys = Object.keys(sources);
          if (Object.keys(sources).length === 1) {
            const entry = sources[keys[0]];
            window.open(typeof entry === "string" ? entry : entry.url);
          } else {
            const { x, y } = view.contentEl.getBoundingClientRect();
            getSrcMenu(sources, plugin.app)?.showAtPosition({ x, y });
          }
        }
      }
    },
  });
};

export default addSrcCommand;
