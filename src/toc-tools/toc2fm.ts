import { EditorRange } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import { getLinkInfo, linkToFmSources, replaceLink, testLink } from "./utils";

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
};
export default Toc2Fm;
