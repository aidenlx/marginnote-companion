import "./heading-src.less";

import { App, MarkdownPostProcessorContext, setIcon } from "obsidian";

import getSrcMenu from "../to-source/src-menu";
import { Heading2Inline } from "./utils";

const srcButton =
  (app: App) =>
  (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    const heading = el.querySelector("h1");
    if (!heading || !ctx.frontmatter?.sources) return;

    const button = createDiv(
      {
        cls: "heading-src",
        attr: { "aria-label": "Go to Source", "aria-label-position": "top" },
      },
      (el) => {
        setIcon(el, "link");
        el.onClickEvent((evt) => {
          getSrcMenu(
            app.metadataCache.getCache(ctx.sourcePath)?.frontmatter?.sources,
            app,
          )?.showAtPosition(
            (evt.target as HTMLElement).getBoundingClientRect(),
          );
        });
      },
    );
    Heading2Inline(heading);

    heading.insertAdjacentElement("afterend", button);
  };

export default srcButton;
