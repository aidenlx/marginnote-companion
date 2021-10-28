import { getApi } from "@aidenlx/folder-note-core";
import { join } from "path";

import MNComp from "../mn-main";

const CopyLinkedToFolder = (plugin: MNComp) => {
  plugin.addCommand({
    id: "linked2folder",
    name: "linked to folder",
    editorCheckCallback: (checking, editor, view) => {
      const srcNote = view.file,
        links = plugin.app.metadataCache.getFileCache(srcNote)?.links,
        folder = getApi(plugin)?.getFolderFromNote(srcNote);
      if (!links || !folder) return false;
      else if (checking) {
        return true;
      } else {
        for (const item of links) {
          const linkFile = plugin.app.metadataCache.getFirstLinkpathDest(
            item.link,
            view.file.path,
          );
          if (linkFile && linkFile.parent.path !== folder.path) {
            plugin.app.fileManager.renameFile(
              linkFile,
              join(folder.path, linkFile.name),
            );
          }
        }
      }
    },
  });
};

export default CopyLinkedToFolder;
