import "./heading-alias.less";

import equal from "fast-deep-equal/es6";
import {
  MarkdownPostProcessorContext,
  parseFrontMatterAliases,
} from "obsidian";

import MNComp from "../mn-main";
import { Heading2Inline } from "./utils";

const addAliasEl = <T extends HTMLDivElement>(
  aliases: string[],
  containerEl: T,
): T => (
  aliases
    .map((v) => createSpan({ text: v }))
    .forEach((span) => containerEl.appendChild(span)),
  containerEl
);

const aliasBelowH1 =
  (plugin: MNComp) =>
  (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    const heading = el.querySelector("h1");
    if (!heading) return;

    const aliases = parseFrontMatterAliases(ctx.frontmatter);
    if (!aliases || aliases.length === 0) return;

    if (!heading.parentElement)
      throw new Error("heading.parentElement is null");

    const container = heading.parentElement.createDiv(
      { cls: "heading-alias" },
      (container) => addAliasEl(aliases, container),
    ) as HTMLDivElement & {
      aliases: string[];
      updateAliases(aliases: string[] | null): void;
    };
    Heading2Inline(heading);

    container.aliases = aliases;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    container.updateAliases = function (aliases) {
      if (!aliases) return;
      if (equal(this.aliases, aliases)) return;
      this.empty();
      addAliasEl(aliases, this);
      this.aliases = aliases;
    };
    const { metadataCache } = plugin.app;
    plugin.registerEvent(
      plugin.app.metadataCache.on("changed", (file) => {
        if (file.path !== ctx.sourcePath) return;
        container.updateAliases(
          parseFrontMatterAliases(
            metadataCache.getFileCache(file)?.frontmatter ?? null,
          ),
        );
      }),
    );
  };

export default aliasBelowH1;
