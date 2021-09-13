import { ReturnBody } from "@aidenlx/obsidian-bridge";
import { decode } from "base64-arraybuffer";
import Mustache from "mustache";
import { MarkdownView, TFile } from "obsidian";

import MNComp from "../mn-main";
import { MNCompSettings } from "../settings";
import { Templates, TplCfgRec } from "../typings/tpl-cfg";
import { getText } from "./basic";

export type PHValMap<T extends string> = Record<T, string | undefined>;

export const getViewKeys = <K extends string>(obj: Record<K, null>) => [
  ...Object.keys(obj),
];

export default abstract class Template<
  T extends keyof MNCompSettings["templates"],
> {
  constructor(protected plugin: MNComp, private templateKey: T) {}
  protected get tplCfg() {
    return this.plugin.settings.templates[this.templateKey].cfgs as Map<
      string,
      TplCfgRec<T>
    >;
  }
  protected getTemplate(name: string) {
    return this.tplCfg.get(name)?.templates as Templates<T> | undefined;
  }

  protected get settings() {
    return this.plugin.settings;
  }
  protected get vault() {
    return this.plugin.app.vault;
  }
  protected get workspace() {
    return this.plugin.app.workspace;
  }
  protected get fileManager() {
    return this.plugin.app.fileManager;
  }
  protected async saveAttachment(
    data: string,
    basename: string,
    ext: string,
    relativeTo?: TFile,
  ): Promise<TFile | null> {
    const buffer = decode(data),
      activeFile =
        relativeTo ??
        this.workspace.getActiveViewOfType(MarkdownView)?.file ??
        null,
      path = await this.vault.getAvailablePathForAttachments(
        basename,
        ext,
        activeFile,
      );
    if (path) return this.vault.createBinary(path, buffer);
    else return null;
  }
  protected getFileLink(
    file: TFile,
    embed: boolean,
    subpath?: string | undefined,
    alias?: string | undefined,
    sourcePath?: string,
  ): string {
    if (!sourcePath)
      sourcePath =
        this.workspace.getActiveViewOfType(MarkdownView)?.file.path ?? "";
    let link = this.fileManager.generateMarkdownLink(
      file,
      sourcePath,
      subpath,
      alias,
    );
    if (embed && !link.startsWith("!")) link = "!" + link;
    if (!embed && link.startsWith("!")) link = link.substring(1);

    return link;
  }
  protected formatDate(time: number | undefined): string | undefined {
    return time
      ? window.moment(time).format(this.settings.defaultDateFormat)
      : undefined;
  }
  protected getText(str: string | undefined, html?: boolean) {
    return getText(str, this.plugin, html);
  }

  protected renderTemplate = <V>(
    template: string,
    view: V,
    partials?: Parameters<typeof Mustache.render>[2],
  ) => Mustache.render(template, view, partials, mustacheConfig);
  abstract render(body: ReturnBody, tplName: string): Promise<string> | string;
  abstract prerender(body: ReturnBody, tplName: string): string;
}

const mustacheConfig = { escape: (text: string) => text };
