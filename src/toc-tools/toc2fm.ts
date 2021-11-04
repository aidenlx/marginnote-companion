import { getSelectedRanges } from "../cm-tools";
import { addToFrontmatter } from "../handlers/frontmatter";
import MNComp from "../mn-main";
import { linkToFmSources, matchLinks } from "./utils";

const Toc2Fm = (plugin: MNComp) => {
  plugin.addCommand({
    id: "toc2fm",
    name: "Toc Item to Frontmatter",
    editorCheckCallback: (checking, editor) => {
      const matchResult = matchLinks(editor, getSelectedRanges(editor));
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
