import { getApi } from "@aidenlx/folder-note-core";
import { App, CachedMetadata, MarkdownView, TFile } from "obsidian";
import { join } from "path";

import MNComp from "../mn-main";

const getRenameAction = (srcNote: TFile, linkFile: TFile, plugin: MNComp) => {
  const { fileManager } = plugin.app;
  const folderForNote = getApi(plugin)?.getFolderFromNote(srcNote);
  if (linkFile.parent.path === (folderForNote ?? srcNote.parent).path) {
    return null;
  } else if (folderForNote) {
    return () =>
      fileManager.renameFile(
        folderForNote,
        join(folderForNote.parent.path, folderForNote.name),
      );
  } else {
    return () =>
      fileManager.renameFile(
        linkFile,
        join(srcNote.parent.path, linkFile.name),
      );
  }
};

const CopyLinkedToFolder = (plugin: MNComp) => {
  const { metadataCache, workspace, fileManager } = plugin.app;
  plugin.addCommand({
    id: "linked2folder",
    name: "linked to folder",
    checkCallback: (checking) => {
      const srcNote = workspace.getActiveViewOfType(MarkdownView)?.file;
      if (!srcNote) return false;
      const cache = metadataCache.getFileCache(srcNote);
      if (!cache) return false;
      else if (checking) {
        return true;
      } else {
        for (const linkFile of allOutgoingLinks(srcNote, cache, plugin.app)) {
          const action = getRenameAction(srcNote, linkFile, plugin);
          action && action();
        }
      }
    },
  });
  plugin.registerEvent(
    workspace.on("file-menu", (menu, linkFile, source, leaf) => {
      if (source !== "link-context-menu" || !(linkFile instanceof TFile))
        return;
      const srcNote = workspace.getActiveViewOfType(MarkdownView)?.file;
      if (!srcNote) return;
      const action = getRenameAction(srcNote, linkFile, plugin);
      if (action) {
        const callback = action;
        menu.addItem((item) =>
          item.setTitle("Move to folder").onClick(callback),
        );
      }
    }),
  );
};

export default CopyLinkedToFolder;

function* allOutgoingLinks(file: TFile, meta: CachedMetadata, app: App) {
  const { metadataCache } = app;
  for (const prop of ["links", "embeds"] as const) {
    const links = meta[prop];
    if (!links) continue;
    for (const cache of links) {
      const linkedFile = metadataCache.getFirstLinkpathDest(
        cache.link,
        file.path,
      );
      if (linkedFile && linkedFile.extension === "md") {
        yield linkedFile;
      }
    }
  }
}
