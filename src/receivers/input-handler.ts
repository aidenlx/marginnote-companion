import {
  checkVersion,
  JsonToObj,
  ReturnBody,
  UrlToObj,
} from "@aidenlx/obsidian-bridge";
import type { Clipboard } from "electron";
import equal from "fast-deep-equal/es6";
import {
  App,
  EventRef,
  Events,
  Notice,
  ObsidianProtocolHandler,
  Platform,
} from "obsidian";
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
  private lastValue: string | ObsidianProtocolData | null = null;
  private init = true;

  /**
   * @param immediate emit event immediately after calling start()
   */
  constructor(public timeInterval = 500, public immediate = false) {
    super();
    if (Platform.isDesktopApp) {
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
          // navigator.clipboard.writeText(RECIEVED_FLAG);
        }
      });
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
      // const cbText = await navigator.clipboard.readText();
      // if (cbText === RECIEVED_FLAG) {
      //   if (this.info.paramsCache) return this.parse(this.info.paramsCache);
      //   else throw new Error("flag in clipboard, no cache in info");
      // } else return null;
      return this.info.paramsCache ? this.parse(this.info.paramsCache) : null;
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
  on(
    name: "changed",
    callback: (val: NonNullable<InputListener["lastValue"]>) => void,
  ): EventRef;
  on(name: string, callback: (...data: any) => any, ctx?: any): EventRef {
    return super.on(name, callback, ctx);
  }
  trigger(name: "url-recieved", params: ObsidianProtocolData): void;
  trigger(name: "changed", val: NonNullable<InputListener["lastValue"]>): void;
  trigger(name: string, ...data: any[]): void {
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
  private tryTriggerChange = (value: string | ObsidianProtocolData) => {
    if (!equal(value, this.lastValue)) {
      this.lastValue = value;

      if (this.immediate || !this.init) {
        this.trigger("changed", value);
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
}
