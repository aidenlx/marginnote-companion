import { App, MarkdownView, Menu, WorkspaceLeaf } from "obsidian";

const label = "Go to Source";

export function addSourceButton(app: App) {

  const apply = () => app.workspace.iterateAllLeaves(addButton.bind(app));

  app.workspace.onLayoutReady(apply);
  app.workspace.on("layout-change", apply);
  
}

function addButton(this: App, leaf: WorkspaceLeaf) {
  if (
    leaf.view instanceof MarkdownView &&
    leaf.view.containerEl.querySelector(
      `a.view-action[aria-label="${label}"]`
    ) === null
  ) {
    let view = leaf.view;
    view.addAction("forward-arrow", label, (evt) => {
      const sources = this.metadataCache.getFileCache(view.file)?.frontmatter
        ?.sources;

      if (!sources) return;

      const menu = new Menu(this);
      for (const key in sources) {
        const docName = key;
        const url = sources[key][1];
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
}

