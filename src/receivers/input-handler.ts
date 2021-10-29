import {
  checkVersion,
  isDataFromMN,
  JsonToObj,
  ReturnBody,
  ReturnBody_Note,
  UrlToObj,
} from "@aidenlx/obsidian-bridge";
import assertNever from "assert-never";
import type { Clipboard } from "electron";
import equal from "fast-deep-equal/es6";
import { EventRef, Events, Notice, Platform, Plugin } from "obsidian";
import { ObsidianProtocolData } from "obsidian";

import { OBBRIDGE_MIN_VERSION } from "../misc";

const RECIEVED_FLAG = "<!--MN_LINK_RECIEVED--->";

type CbInfo = {
  /** null when id = 0 */
  intervalId: number;
  instance: Clipboard;
};
type UrlInfo = {
  /** trigger changed event */
  autoPasteRef: EventRef | null;
  paramsCache: ObsidianProtocolData | null;
};
const isCbInfo = (info: InputListener["info"]): info is CbInfo =>
  typeof (info as CbInfo).intervalId === "number";
export default class InputListener extends Events {
  info: CbInfo | UrlInfo;

  /** only used for auto paste */
  private lastValue: {
    raw: string | ObsidianProtocolData;
    body: ReturnBody;
  } | null = null;
  private init = true;

  /**
   * @param immediate emit event immediately after calling start()
   */
  constructor(
    plugin: Plugin,
    public timeInterval = 500,
    public immediate = false,
  ) {
    super();
    plugin.register(this.destroy.bind(this));
    if (Platform.isDesktopApp && !Platform.isMobile) {
      let electron: typeof Electron;
      try {
        electron = require("electron");
      } catch (error) {
        new Notice("Failed to load electron dependencies on desktop");
        throw error;
      }
      this.info = { instance: electron.clipboard, intervalId: 0 };
    } else {
      this.info = { autoPasteRef: null, paramsCache: null };
      // insert recieved flag to clipboard and save val to cache
      this.on("url-recieved", (params) => {
        if (!this.info || isCbInfo(this.info))
          console.error(
            "url-recieved triggered with invaild info, %o",
            this.info,
          );
        else {
          this.info.paramsCache = params;
          navigator.clipboard.writeText(RECIEVED_FLAG);
        }
      });
    }
  }

  checkIsMNData(input: ClipboardEvent | string): boolean {
    const text =
      typeof input === "string" ? input : input.clipboardData?.getData("text");
    if (isCbInfo(this.info)) return !!text && isDataFromMN(text);
    else if (this.info === undefined) return false;
    else return !!text && text === RECIEVED_FLAG;
  }

  isDataAvailable(): boolean {
    if (this.info === undefined) {
      console.error("Call InputListener before init");
      return false;
    } else if (isCbInfo(this.info)) {
      return this.checkIsMNData(this.info.instance.readText());
    } else {
      return !!this.info.paramsCache;
    }
  }

  /** read from clipboard/cache */
  async readFromInput(): Promise<ReturnBody | null> {
    if (this.info === undefined) {
      console.error("Call InputListener before init");
      return null;
    } else if (isCbInfo(this.info)) {
      return this.parse(this.info.instance.readText());
    } else {
      const cbText = await navigator.clipboard.readText();
      if (cbText === RECIEVED_FLAG) {
        if (this.info.paramsCache) return this.parse(this.info.paramsCache);
        else {
          new Notice("flag in clipboard, no cache in info");
          return null;
        }
      } else return null;
    }
  }
  /**
   * @returns null if invaild
   */
  private parse(src: string | ObsidianProtocolData): ReturnBody | null {
    const result = typeof src === "string" ? JsonToObj(src) : UrlToObj(src);
    if (!result) return null;
    const verCompare = checkVersion(result[0], OBBRIDGE_MIN_VERSION);
    if (verCompare === null) {
      new Notice(`Unable to compare version: ${result[0]}`);
      console.error("Unable to compare version in %o", result);
      return null;
    } else if (verCompare < 0) {
      new Notice(
        `Please Upgrade Obsidian Bridge to v${OBBRIDGE_MIN_VERSION} or Higher`,
      );
      return null;
    } else return result[1];
  }

  private _watching = false;
  public get autoPaste(): boolean {
    return this._watching;
  }
  public set autoPaste(v: boolean) {
    v ? this.start() : this.stop();
  }

  // refs: EventRef[] = [];
  on(
    name: "url-recieved",
    callback: (params: ObsidianProtocolData) => void,
  ): EventRef;
  on(name: "changed", callback: (data: ReturnBody) => void): EventRef;
  on(name: string, callback: (...data: any) => any, ctx?: any): EventRef {
    return super.on(name, callback, ctx);
  }
  trigger(name: "url-recieved", params: ObsidianProtocolData): void;
  trigger(name: "changed", data: ReturnBody): void;
  trigger(name: string, ...data: any[]): void {
    if (name !== "url-recieved" || isDataFromMN(data[0]))
      super.trigger(name, ...data);
  }

  /**
   * Start watching for the clipboard changes
   */
  start(): void {
    this._watching = true;
    if (isCbInfo(this.info)) {
      const info = this.info;
      if (info.intervalId !== 0) return;
      this.init = true;
      info.intervalId = window.setInterval(
        () => this.tryTriggerChange(info.instance.readText()),
        this.timeInterval,
      );
    } else {
      this.info.autoPasteRef = this.on("url-recieved", this.tryTriggerChange);
      this.init = false;
    }
  }

  /**
   * @returns ReturnBody if updated successfully, null if the same
   */
  private tryUpdateLastValue(
    raw: string | ObsidianProtocolData,
  ): ReturnBody | null {
    /**
     * save if given body param not null
     * @returns given param body
     */
    const save = <T extends ReturnBody | null>(body: T) => (
      body && (this.lastValue = { raw, body }), body
    );
    if (this.lastValue === null) {
      const body = this.parse(raw);
      return save(body);
    } else if (raw === this.lastValue.raw) {
      return null;
    } else {
      const body = this.parse(raw);
      if (!body) return null;
      if (body.type !== this.lastValue.body.type) {
        return save(body);
      }

      let isEqual: boolean;
      switch (body.type) {
        case "note":
        case "toc":
          isEqual =
            body.data.noteId ===
              (this.lastValue.body as ReturnBody_Note).data.noteId ||
            equal(body.data, this.lastValue.body.data);
          break;
        case "sel":
          isEqual = equal(body.data, this.lastValue.body.data);
          break;
        default:
          assertNever(body);
      }
      return isEqual ? null : save(body);
    }
  }

  private tryTriggerChange = (raw: string | ObsidianProtocolData) => {
    const body = this.tryUpdateLastValue(raw);
    if (body) {
      if (this.immediate || !this.init) {
        this.trigger("changed", body);
      }
      if (this.init) this.init = false;
    }
  };

  /**
   * Stop watching
   */
  stop(): void {
    this._watching = false;
    if (isCbInfo(this.info)) {
      if (this.info.intervalId !== undefined) {
        clearInterval(this.info.intervalId);
        this.info.intervalId = 0;
        // this.refs.forEach((ref) => this.offref(ref));
        this.lastValue = null;
      }
    } else {
      this.info.autoPasteRef && this.offref(this.info.autoPasteRef);
      this.info.autoPasteRef = null;
    }
  }

  destroy() {
    this.stop();
  }
}
