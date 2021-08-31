import { FuzzyMatch, FuzzySuggestModal, Notice, TFile } from "obsidian";
import Url from "url-parse";

import MNComp from "../mn-main";

const exts = ["mp4", "ogv", "webm"],
  protocals = ["http", "https", "file"],
  isUrl = (str: string) => {
    const url = new Url(str);
    return protocals.includes(url.protocol) && !!url.hostname;
  };
type promiseVal = string | TFile | null;

export default class AddNewVideo extends FuzzySuggestModal<TFile> {
  private get videoMap() {
    return this.plugin.settings.videoMap;
  }
  private get vault() {
    return this.plugin.app.vault;
  }
  public async getLink(): Promise<string | TFile | null> {
    const val = this.videoMap.get(this.md5);
    if (val) {
      let file;
      if (isUrl(val.mapTo)) return val.mapTo;
      else if (
        (file = this.vault.getAbstractFileByPath(val.mapTo)) &&
        file instanceof TFile &&
        exts.includes(file.extension)
      )
        return file;
      else {
        new Notice(
          `Invaild path "${val.mapTo}" for video ${val.srcName}, go to setting to correct video map`,
        );
        return null;
      }
    } else
      return this.open().then(async (val) => {
        // save to videoMap
        if (val) {
          this.videoMap.set(this.md5, {
            srcName: this.srcName,
            mapTo: typeof val === "string" ? val : val.path,
          });
          await this.plugin.saveSettings();
        }
        return val;
      });
  }
  emptyStateText =
    "The imported video note from MarginNote 3 has not been mapped to obsidian, Enter the designated file name / URL to continue";

  resolve: ((value: promiseVal | PromiseLike<promiseVal>) => void) | null =
    null;
  open(): Promise<promiseVal> {
    super.open();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  selectSuggestion(
    value: FuzzyMatch<TFile> | null,
    evt: MouseEvent | KeyboardEvent,
  ): void {
    if (this.resolve) this.resolve(value?.item ?? this.inputEl.value);
    super.selectSuggestion(value as any, evt);
  }
  onClose() {
    if (this.resolve) this.resolve(null);
  }
  constructor(
    private plugin: MNComp,
    private srcName: string,
    private md5: string,
  ) {
    super(plugin.app);
    this.setPlaceholder(`Select File/Enter URL designated to ${srcName}`);
    this.setInstructions([
      {
        command: "↑↓",
        purpose: "Navigate",
      },
      {
        command: "↵",
        purpose: "Map to selected file/url",
      },
      {
        command: "esc",
        purpose: "Skip",
      },
    ]);
  }
  getItems(): TFile[] {
    return this.app.vault.getFiles().filter((f) => exts.includes(f.extension));
  }
  getItemText(item: TFile): string {
    return item.name;
  }
  onChooseItem(item: TFile | null, evt: MouseEvent | KeyboardEvent): void {
    // console.log(item ?? this.inputEl.value, evt);
  }
  onChooseSuggestion(
    value: FuzzyMatch<TFile> | null,
    evt: MouseEvent | KeyboardEvent,
  ) {
    this.onChooseItem(value?.item ?? null, evt);
  }
  renderSuggestion(item: FuzzyMatch<TFile> | null, el: HTMLElement) {
    if (item) super.renderSuggestion(item, el);
    else if (isUrl(this.inputEl.value)) {
      el.setText(this.inputEl.value);
      el.createEl("kbd", {
        cls: "suggestion-hotkey",
        text: "enter to use url",
      });
      el.createSpan({
        cls: "suggestion-flair",
        prepend: !0,
      });
    } else {
      this.emptyStateText = "invaild url";
    }
  }
  onNoSuggestion() {
    // @ts-ignore
    this.chooser.setSuggestions([null]);
    // @ts-ignore
    this.chooser.addMessage(this.emptyStateText);
  }
}
