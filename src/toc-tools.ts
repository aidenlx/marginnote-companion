import MNComp from "./mn-main";
import ExtractHeading from "./toc-tools/extract-heading";
import HideInlineSrc from "./toc-tools/hide-inline-src";
import CopyLinkedToFolder from "./toc-tools/linked2folder";
import Toc2File from "./toc-tools/toc2file";
import Toc2Fm from "./toc-tools/toc2fm";
import Toc2Heading from "./toc-tools/toc2head";

const setupTocTools = (plugin: MNComp) => {
  ExtractHeading(plugin);
  Toc2Fm(plugin);
  Toc2File(plugin);
  Toc2Heading(plugin);
  CopyLinkedToFolder(plugin);
  HideInlineSrc(plugin);
};

export default setupTocTools;
