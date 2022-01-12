import srcButton from "./controls/heading-src";
import MNComp from "./mn-main";
import addSrcButton from "./to-source/src-button";
import addSrcCommand from "./to-source/src-cmd";

const setupToSrcTools = (plugin: MNComp) => {
  addSrcButton(plugin);
  addSrcCommand(plugin);
  plugin.registerMarkdownPostProcessor(srcButton(plugin.app));
};

export default setupToSrcTools;
