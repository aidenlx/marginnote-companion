import "obsidian";

import { i18n } from "i18next";
declare module "obsidian" {
  interface MenuItem {
    iconEl: HTMLDivElement;
  }
  interface Vault {
    getAvailablePathForAttachments(
      basename: string,
      ext: string,
      file: TFile | null,
    ): Promise<string | null>;
    getConfig(key: "useTab"): boolean;
    getConfig(key: "tabSize"): number;
    getConfig(key: string): any;
  }
  interface Menu {
    select(index: number): void;
  }
}

declare global {
  const i18next: i18n;
}
