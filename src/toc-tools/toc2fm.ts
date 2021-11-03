import { EditorRange } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import { linkToFmSources, matchLinks } from "./utils";

const Toc2Fm = (plugin: MNComp) => {
  plugin.addCommand({
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
      const matchResult = matchLinks(editor, ranges);
      if (checking) {
        return !!matchResult;
      } else {
        const { changes, links } = matchResult;
        editor.transaction({ changes });
        addToFrontmatter("sources", linkToFmSources(links), editor);
      }
    },
  });
};
export default Toc2Fm;
