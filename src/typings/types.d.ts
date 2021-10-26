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
  interface App {
    internalPlugins: {
      plugins: {
        ["note-composer"]?: {
          instance: {
            getSelectionUnderHeading(
              file: TFile,
              editor: Editor,
              startLineNum: number,
            ): {
              start: EditorPosition;
              end: EditorPosition;
              heading: string;
            } | null;
            options: {
              replacementText: string;
            };
          };
        };
      };
    };
  }
  interface FileManager {
    createNewMarkdownFileFromLinktext(
      linktext: string,
      path: string,
    ): Promise<TFile | null>;
  }
}

declare global {
  const i18next: i18n;
}
