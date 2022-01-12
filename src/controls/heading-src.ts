import "./heading-src.less";

import { App, MarkdownPostProcessorContext, setIcon } from "obsidian";

import getSrcMenu, { getSourcesFromFile } from "../to-source/src-menu";
import { Heading2Inline } from "./utils";

const cls = "heading-src";
const srcButton =
  (app: App) =>
  (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    const heading = el.querySelector("h1");
    if (
      !heading ||
      !!heading.querySelector(`:scope > .${cls}`) ||
      !ctx.frontmatter?.sources
    )
      return;

    const button = createDiv(
      {
        cls,
        attr: { "aria-label": "Go to Source", "aria-label-position": "top" },
      },
      (el) => {
        setIcon(el, "link");
        el.onClickEvent((evt) => {
          const sources = getSourcesFromFile(ctx.sourcePath, app);
          getSrcMenu(sources, app)?.showAtPosition(
            (evt.target as HTMLElement).getBoundingClientRect(),
          );
        });
      },
    );
    Heading2Inline(heading);

    heading.insertAdjacentElement("afterend", button);
  };

export default srcButton;
