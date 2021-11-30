import { getApi } from "@aidenlx/folder-note-core";
import { App, CachedMetadata, MarkdownView, TFile } from "obsidian";
import { join } from "path";

import MNComp from "../mn-main";

const CopyLinkedToFolder = (plugin: MNComp) => {
  plugin.addCommand({
    id: "linked2folder",
    name: "linked to folder",
    checkCallback: (checking) => {
      const { metadataCache, workspace, fileManager } = plugin.app;
      const srcNote = workspace.getActiveViewOfType(MarkdownView)?.file;
      if (!srcNote) return false;
      const cache = metadataCache.getFileCache(srcNote),
        folder = getApi(plugin)?.getFolderFromNote(srcNote) ?? srcNote.parent;
      if (!cache) return false;
      else if (checking) {
        return true;
      } else {
        for (const linkFile of allOutgoingLinks(srcNote, cache, plugin.app)) {
          if (linkFile.parent.path === folder.path) continue;
          fileManager.renameFile(linkFile, join(folder.path, linkFile.name));
        }
      }
    },
  });
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
