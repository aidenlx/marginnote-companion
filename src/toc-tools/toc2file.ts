import { getApi } from "@aidenlx/folder-note-core";
import { Notice } from "obsidian";
import { join } from "path";

import { getFrontmatter } from "../handlers/frontmatter";
import StripChapterNum, { StripChNumPattern } from "../macros/strip-ch-num";
import MNComp from "../mn-main";
import { linkToFmSources, matchEntry } from "./utils";

const Toc2File = (plugin: MNComp) => {
  plugin.addCommand({
    id: "toc2file",
    name: "Toc Entry to File",
    editorCheckCallback: (checking, editor, view) => {
      const matchResult = matchEntry(editor);
      if (checking) {
        return !!matchResult;
      } else {
        if (!matchResult) return;
        const { links, desc, isDeeper, outdentLine, replacePara } = matchResult,
          /** get range of text to be extracted into new file */
          getRange = (lineNumStart: number) => {
            let output = "",
              currLine;
            while (
              (currLine = editor.getLine(++lineNumStart)) &&
              isDeeper(currLine)
            ) {
              output += "\n" + outdentLine(currLine);
            }
            return [output, lineNumStart - 1] as const;
          };
        const lineStart = editor.getCursor().line,
          [content, lineEnd] = getRange(lineStart);
        const title = desc.replace(StripChNumPattern, "");
        const newFileContent =
          getFrontmatter({ sources: linkToFmSources(links) }) +
          "\n\n" +
          `# ${title}` +
          "\n" +
          content;
        (async () => {
          let folder = getApi(plugin)?.getFolderFromNote(view.file);
          if (!folder) folder = view.file.parent;
          // extract to new file and get link to it
          const newFilePath = join(
            folder.isRoot() ? "" : folder.path,
            title + ".md",
          );
          if (await plugin.app.vault.adapter.exists(newFilePath)) {
            new Notice(`File ${newFilePath} already exists`);
            return;
          }
          const file = await plugin.app.vault.create(
              newFilePath,
              newFileContent,
            ),
            fileMark = plugin.app.fileManager.generateMarkdownLink(
              file,
              view.file.path,
            ),
            changes = [
              replacePara(() => fileMark),
              {
                from: { line: lineStart, ch: Infinity },
                to: { line: lineEnd, ch: Infinity },
                text: "",
              },
            ];
          // replace text with link to new file
          editor.transaction({ changes });
        })();
      }
    },
  });
};

export default Toc2File;
