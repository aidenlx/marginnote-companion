import { ReturnBody } from "@aidenlx/obsidian-bridge";
import { decode } from "base64-arraybuffer";
import Mustache from "mustache";
import { MarkdownView, TFile } from "obsidian";

import MNComp from "../mn-main";
import { TplCfgRec, TplCfgTypes } from "../typings/tpl-cfg";
import Text from "./basic/text";

export type PHValMap<T extends string> = Record<T, string | undefined>;

export const getViewKeys = <K extends string>(obj: Record<K, null>) => [
  ...Object.keys(obj),
];

export default abstract class Template<T extends TplCfgTypes> {
  constructor(protected plugin: MNComp, private templateKey: T) {}
  protected getTplCfg(name: string) {
    let cfg = this.plugin.settings.templates[this.templateKey].cfgs.get(name);
    if (!cfg) throw this.NoTemplateFoundError(name);
    else return cfg as TplCfgRec<T>;
  }
  protected getTemplate(name: string) {
    return this.getTplCfg(name).templates;
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
    return Text.getInst(str, this.plugin, html);
  }

  protected renderTemplate = <V>(
    template: string,
    view: V,
    partials?: Parameters<typeof Mustache.render>[2],
  ) => Mustache.render(template, view, partials, mustacheConfig);
  abstract render(body: ReturnBody, tplName: string): Promise<string> | string;
  abstract prerender(body: ReturnBody, tplName: string): string;

  protected NoTemplateFoundError(name: string) {
    return new NoTplFoundError(name, this.templateKey);
  }
  protected RenderError(internalErr: unknown, tplName: string) {
    return new RenderError(internalErr, tplName, this.templateKey);
  }
}
export class RenderError extends Error {
  constructor(
    internalErr: unknown,
    public tplName: string,
    public type: TplCfgTypes,
  ) {
    super(
      internalErr instanceof Error
        ? `${internalErr.name}: ${internalErr.message}`
        : JSON.stringify(internalErr),
    );
    this.name = `RenderError(${type}-${tplName})`;
  }
}
export class NoTplFoundError extends Error {
  constructor(public tplName: string, public type: TplCfgTypes) {
    super(`No template named ${tplName} found in type ${type}}`);
    this.tplName = "NoTemplateFoundError";
  }
}

const mustacheConfig = { escape: (text: string) => text };
