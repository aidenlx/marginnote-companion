import "./mn-inline-src.less";

import MNComp from "../mn-main";

const handleMNLink = (a: Element) => {
  const anchor = a as HTMLAnchorElement;
  anchor.setAttr("aria-label", anchor.textContent?.trim() ?? "MarginNote Link");
  anchor.setAttr("aria-label-position", "bottom");
  anchor.title = "";
  anchor.textContent = null;
};

const HideInlineSrc = (plugin: MNComp) => {
  plugin.registerMarkdownPostProcessor((el) => {
    // handle link only <p>
    if (el.childNodes.length === 1 && isLinkOnly(el.firstElementChild)) {
      el.addClass("mn-inline-src");
      const p = el.firstElementChild as HTMLElement;
      // p.replaceWith(...p.children);
      for (const a of p.children) {
        handleMNLink(a);
      }
    } else {
      el.querySelectorAll("a.external-link[href^=marginnote3app]").forEach(
        handleMNLink,
      );
    }
  });
};

const isLinkOnly = (el: Element | null) => {
  if (!(el instanceof HTMLParagraphElement)) return false;
  for (const node of el.childNodes) {
    if (
      !(node instanceof HTMLAnchorElement) ||
      !node.href.startsWith("marginnote3app")
    )
      return false;
  }
  return true;
};

export default HideInlineSrc;
