import { getFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import { linkToFmSources, matchLinkOnly } from "./utils";

const ExtractHeading = (plugin: MNComp) => {
  const getHeading = (str: string) => {
      var matched = str.match(/^(?<mark>#{1,6}) (?<content>.*)/m);
      return (matched?.groups ?? null) as Record<
        "mark" | "content",
        string
      > | null;
    },
    getNoteComposer = () =>
      plugin.app.internalPlugins.plugins["note-composer"]?.instance;
  plugin.registerEvent(
    plugin.app.workspace.on("editor-menu", (menu, editor, view) => {
      if (!getNoteComposer() || editor.somethingSelected()) return;
      const { line: lineCursorAt } = editor.getCursor();

      if (getHeading(editor.getLine(lineCursorAt)) !== null) {
        const extractHeading = async () => {
          let composer = getNoteComposer();
          const sectionInfo = composer?.getSelectionUnderHeading(
            view.file,
            editor,
            lineCursorAt,
          );
          if (!composer || !sectionInfo) return;
          let firstHeading = getHeading(editor.getLine(sectionInfo.start.line));
          if (!firstHeading) {
            console.error("first line not heading");
            return;
          }
          editor.setSelection(sectionInfo.start, sectionInfo.end);
          let sectionText = editor
            .getSelection()
            .replace(new RegExp(`^${firstHeading.mark}`, "gm"), "#");

          // fetch links
          const matchedInfo = matchLinkOnly(sectionText);
          if (matchedInfo) {
            sectionText =
              getFrontmatter({
                sources: linkToFmSources(matchedInfo.links),
              }) +
              "\n\n" +
              matchedInfo.linksRemoved;
          }
          // create new note
          let newFile =
            await plugin.app.fileManager.createNewMarkdownFileFromLinktext(
              sectionInfo.heading,
              view.file.path,
            );
          if (!newFile) {
            console.error("file create failed");
            return;
          }
          await plugin.app.vault.modify(newFile, sectionText);

          // replace section with link
          const mdLink = plugin.app.fileManager.generateMarkdownLink(
            newFile,
            view.file.path,
          );
          switch (composer.options.replacementText) {
            case "embed":
              editor.replaceSelection("!" + mdLink);
              break;
            case "none":
              editor.replaceSelection("");
              break;
            default:
              editor.replaceSelection(mdLink);
              break;
          }
        };
        menu.addItem((item) =>
          item
            .setTitle("Extract Heading, mninfo -> fm")
            .setIcon("split")
            .onClick(extractHeading),
        );
      }
    }),
  );
};

export default ExtractHeading;
