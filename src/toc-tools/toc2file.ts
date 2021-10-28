import { getApi } from "@aidenlx/folder-note-core";
import { join } from "path";

import { getFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import {
  getFirstSelectedLine,
  linkToFmSources,
  matchEntry,
  test,
} from "./utils";

const Toc2File = (plugin: MNComp) => {
  plugin.addCommand({
    id: "toc2file",
    name: "Toc Entry to File",
    editorCheckCallback: (checking, editor, view) => {
      let { line: firstLine, lineNum: lineStart } =
        getFirstSelectedLine(editor);
      if (checking) {
        return test(firstLine);
      } else {
        let matched = matchEntry(firstLine);
        if (!matched) {
          console.error("Invaild given", firstLine);
          return;
        }
        const {
            links,
            isNextIndent,
            removeNextIndent,
            replaceTitleWith,
            title,
          } = matched,
          sources = linkToFmSources(links),
          /** get range of text to be extracted into new file */
          getRange = (lineStartNum: number) => {
            let output = "",
              currLine;
            while (
              (currLine = editor.getLine(++lineStartNum)) &&
              isNextIndent(currLine)
            ) {
              output += "\n" + removeNextIndent(currLine);
            }
            return [output, lineStartNum - 1] as const;
          };

        const [content, lineEnd] = getRange(lineStart);
        const newFileContent =
          getFrontmatter({ sources }) + "\n\n" + `# ${title}` + "\n" + content;
        (async () => {
          let folder = getApi(plugin)?.getFolderFromNote(view.file);
          if (!folder) folder = view.file.parent;
          // extract to new file and get link to it
          const file = await plugin.app.vault.create(
              join(folder.isRoot() ? "" : folder.path, title + ".md"),
              newFileContent,
            ),
            fileMark = plugin.app.fileManager.generateMarkdownLink(
              file,
              view.file.path,
            );
          editor.replaceRange(
            replaceTitleWith(fileMark),
            { line: lineStart, ch: 0 },
            { line: lineEnd, ch: Infinity },
          );
        })();
      }
    },
  });
};

export default Toc2File;
