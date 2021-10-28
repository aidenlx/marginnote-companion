import { MarkdownView } from "obsidian";

import MNComp from "../mn-main";
import getSrcMenu, { isObjSrc } from "./src-menu";

const getIt = (plugin: MNComp) => {
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
      const it = getIt(plugin);
      if (checking) {
        return !!(it && isObjSrc(it.sources));
      } else if (it) {
        const { view, sources } = it;
        if (isObjSrc(sources)) {
          const keys = Object.keys(sources);
          if (Object.keys(sources).length === 1) {
            window.open(sources[keys[0]].url);
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
