import { getApi } from "@aidenlx/folder-note-core";
import {
  addIcon,
  Editor,
  EditorRange,
  MarkdownView,
  Menu,
  Plugin,
} from "obsidian";
import { join } from "path";
import { MNCompSettingTab } from "setting-tab";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  MNCompSettings,
  saveSettings,
} from "settings";

import aliasBelowH1 from "./controls/heading-alias";
import { addToFrontmatter, getFrontmatter } from "./handlers/frontmatter";
import MNDataHandler from "./handlers/mn-data-handler";
import icons from "./icons";
import { MacroHandler, registerMacroCmd } from "./macros/macro-handler";
import { setAutoPaste } from "./receivers/autopaste";
import InputListener from "./receivers/input-handler";
import setInsertData from "./receivers/insert";
import setupToSrcTools from "./to-src";
import {
  entry2Heading,
  getFirstSelectedLine,
  getLinkInfo,
  linkToFmSources,
  matchEntry,
  matchLinkOnly,
  replaceLink,
  test,
  testLink,
} from "./toc-tools";

export default class MNComp extends Plugin {
  settings: MNCompSettings = DEFAULT_SETTINGS;

  inputListener = new InputListener(this);
  mnHandler = new MNDataHandler(this);

  loadSettings = loadSettings.bind(this);
  saveSettings = saveSettings.bind(this);

  async onload() {
    console.log("loading marginnote-companion");
    icons.forEach((params) => addIcon(...params));

    await this.loadSettings();
    this.addSettingTab(new MNCompSettingTab(this));

    // register mn note handlers
    setInsertData(this);

    this.registerEditorMenu();
    setAutoPaste(this);
    this.addCommand({
      id: "getMeta",
      name: "get Metadata from MarginNote notes",
      editorCallback: async (_editor, view) => {
        this.mnHandler.importMeta(view);
      },
    });
    registerMacroCmd.call(this);

    // Enable GUI Modification
    this.registerMarkdownPostProcessor(aliasBelowH1(this));
    setupToSrcTools(this);

    // URL Scheme handlers
    this.registerObsidianProtocolHandler("mncomp", (params) => {
      if (params.macros) MacroHandler.call(this, params);
      else if (params.version)
        this.inputListener.trigger("url-recieved", params);
    });

    // toc tools
    const getHeading = (str: string) => {
        var matched = str.match(/^(?<mark>#{1,6}) (?<content>.*)/m);
        return (matched?.groups ?? null) as Record<
          "mark" | "content",
          string
        > | null;
      },
      getNoteComposer = () =>
        this.app.internalPlugins.plugins["note-composer"]?.instance;
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor, view) => {
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
            let firstHeading = getHeading(
              editor.getLine(sectionInfo.start.line),
            );
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
              await this.app.fileManager.createNewMarkdownFileFromLinktext(
                sectionInfo.heading,
                view.file.path,
              );
            if (!newFile) {
              console.error("file create failed");
              return;
            }
            await this.app.vault.modify(newFile, sectionText);

            // replace section with link
            const mdLink = this.app.fileManager.generateMarkdownLink(
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
    this.addCommand({
      id: "toc2fm",
      name: "Toc Item to Frontmatter",
      editorCheckCallback: (checking, editor) => {
        let ranges: EditorRange[] = [];
        const { line } = editor.getCursor();
        if (!editor.somethingSelected()) {
          ranges = [{ from: { ch: 0, line }, to: { ch: Infinity, line } }];
        } else {
          ranges = editor
            .listSelections()
            .map((sel) => ({ from: sel.anchor, to: sel.head }));
        }
        if (checking) {
          return ranges.some((range) =>
            testLink(editor.getRange(range.from, range.to)),
          );
        } else {
          let rangeText = ranges
            .map((range) => ({
              ...range,
              text: editor.getRange(range.from, range.to),
            }))
            .filter((rt) => testLink(rt.text));
          const links = rangeText.map((rt) => getLinkInfo(rt.text)).flat(1);
          rangeText.forEach((rt) => (rt.text = replaceLink(rt.text, "")));
          editor.transaction({ changes: rangeText });
          addToFrontmatter("sources", linkToFmSources(links), editor);
        }
      },
    });
    this.addCommand({
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
            getFrontmatter({ sources }) +
            "\n\n" +
            `# ${title}` +
            "\n" +
            content;
          (async () => {
            let folder = getApi(this)?.getFolderFromNote(view.file);
            if (!folder) folder = view.file.parent;
            // extract to new file and get link to it
            const file = await this.app.vault.create(
                join(folder.isRoot() ? "" : folder.path, title + ".md"),
                newFileContent,
              ),
              fileMark = this.app.fileManager.generateMarkdownLink(
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
    const toc2head =
      (whole: boolean) => (checking: boolean, editor: Editor) => {
        const { line: cursorLineNum } = editor.getCursor(),
          activeLine = editor.getLine(cursorLineNum);
        if (checking) {
          return test(activeLine);
        } else {
          let range: EditorRange = {
            from: { line: cursorLineNum, ch: 0 },
            to: { line: cursorLineNum, ch: Infinity },
          };
          while (test(editor.getLine(range.from.line - 1))) {
            range.from.line--;
          }
          while (test(editor.getLine(range.to.line + 1))) {
            range.to.line++;
          }
          editor.setSelection(range.from, range.to);
          editor.replaceSelection(
            entry2Heading(
              editor.getSelection(),
              whole ? undefined : activeLine,
            ).replace(/\n{3,}/g, "\n\n"),
          );
        }
      };
    this.addCommand({
      id: "toclist2head",
      name: "Toc List to Headings",
      editorCheckCallback: toc2head(true),
    });
    this.addCommand({
      id: "tocitem2head",
      name: "Toc Items to Headings (level above active line)",
      editorCheckCallback: toc2head(false),
    });
    this.addCommand({
      id: "linked2folder",
      name: "linked to folder",
      editorCheckCallback: (checking, editor, view) => {
        const srcNote = view.file,
          links = this.app.metadataCache.getFileCache(srcNote)?.links,
          folder = getApi(this)?.getFolderFromNote(srcNote);
        if (!links || !folder) return false;
        else if (checking) {
          return true;
        } else {
          for (const item of links) {
            const linkFile = this.app.metadataCache.getFirstLinkpathDest(
              item.link,
              view.file.path,
            );
            if (linkFile && linkFile.parent.path !== folder.path) {
              this.app.fileManager.renameFile(
                linkFile,
                join(folder.path, linkFile.name),
              );
            }
          }
        }
      },
    });
  }

  registerEditorMenu() {
    const onEditorMenu = async (
      menu: Menu,
      _editor: any,
      view: MarkdownView,
    ) => {
      const data = await this.inputListener.readFromInput();

      if (!data) return;
      const templates = this.settings.templates[data.type],
        getClickHandler = (tpl: string) => () =>
          this.mnHandler.insertToNote(view, { target: data, tplName: tpl });
      let subMenu = new Menu(this.app),
        hasSub = false;
      for (const [name, tpl] of templates.cfgs) {
        if (tpl.pin) {
          menu.addItem((item) =>
            item
              .setTitle(`${data.type}: ${name}`)
              .setIcon("mn-fill")
              .onClick(getClickHandler(name)),
          );
        } else {
          hasSub || (hasSub = true);
          subMenu.addItem((item) => {
            item.setTitle(`${name}`).onClick(getClickHandler(name));
            item.iconEl.parentElement?.removeChild(item.iconEl);
          });
        }
      }
      if (hasSub)
        menu.addItem((item) =>
          item
            .setTitle(`${data.type}: ...`)
            .setIcon("mn-fill")
            .onClick((evt) =>
              evt instanceof MouseEvent
                ? subMenu.showAtMouseEvent(evt)
                : subMenu.showAtPosition(item.iconEl.getBoundingClientRect()),
            ),
        );
    };
    this.registerEvent(this.app.workspace.on("editor-menu", onEditorMenu));
  }
}
