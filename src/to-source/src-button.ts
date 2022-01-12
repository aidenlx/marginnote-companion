import { around } from "monkey-around";
import { MarkdownView, Plugin } from "obsidian";

import getSrcMenu, { getSourcesFromFile } from "./src-menu";

const label = "Go to Source";

const addSrcButton = (plugin: Plugin) => {
  plugin.register(
    around(MarkdownView.prototype, {
      onload: (original) =>
        function (this: MarkdownView) {
          this.addAction("forward-arrow", label, (evt) => {
            const sources = getSourcesFromFile(this.file, plugin.app);
            getSrcMenu(sources, plugin.app)?.showAtPosition({
              x: evt.x,
              y: evt.y,
            });
          });
          return original.call(this);
        },
    }),
  );
};

export default addSrcButton;
