import { App, MarkdownView, WorkspaceLeaf } from "obsidian";

import getSrcMenu from "./src-menu";

const label = "Go to Source";

const addSrcButton = (app: App) => {
  const apply = () => app.workspace.iterateAllLeaves(addButton(app));

  app.workspace.onLayoutReady(apply);
  app.workspace.on("layout-change", apply);
};

const addButton = (app: App) => (leaf: WorkspaceLeaf) => {
  if (
    leaf.view instanceof MarkdownView &&
    leaf.view.containerEl.querySelector(
      `a.view-action[aria-label="${label}"]`,
    ) === null
  ) {
    let view = leaf.view;
    view.addAction("forward-arrow", label, (evt) => {
      getSrcMenu(
        app.metadataCache.getFileCache(view.file)?.frontmatter?.sources,
        app,
      )?.showAtPosition({ x: evt.x, y: evt.y });
    });
  }
};

export default addSrcButton;
