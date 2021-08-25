import { App, MarkdownView, Menu, WorkspaceLeaf } from "obsidian";

const label = "Go to Source";

export const addSourceButton = (app: App) => {
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
      const sources = app.metadataCache.getFileCache(view.file)?.frontmatter
        ?.sources;

      if (!sources) return;

      const menu = new Menu(app);
      for (const key in sources) {
        const docName = key;
        const url = sources[key].url;
        if (url)
          menu.addItem((item) => {
            item
              .setIcon("link")
              .setTitle(docName)
              .onClick(() => window.open(url));
          });
      }
      menu.showAtPosition({ x: evt.x, y: evt.y });
    });
  }
};
