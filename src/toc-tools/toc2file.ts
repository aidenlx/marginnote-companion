import { getApi } from "@aidenlx/folder-note-core";
import { join } from "path";

import { getFrontmatter } from "../handlers/frontmatter";
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
        const newFileContent =
          getFrontmatter({ sources: linkToFmSources(links) }) +
          "\n\n" +
          `# ${desc}` +
          "\n" +
          content;
        (async () => {
          let folder = getApi(plugin)?.getFolderFromNote(view.file);
          if (!folder) folder = view.file.parent;
          // extract to new file and get link to it
          const file = await plugin.app.vault.create(
              join(folder.isRoot() ? "" : folder.path, desc + ".md"),
              newFileContent,
            ),
            fileMark = plugin.app.fileManager.generateMarkdownLink(
              file,
              view.file.path,
            );
          editor.replaceRange(
            replacePara(() => fileMark).text,
            { line: lineStart, ch: 0 },
            { line: lineEnd, ch: Infinity },
          );
        })();
      }
    },
  });
};

export default Toc2File;
