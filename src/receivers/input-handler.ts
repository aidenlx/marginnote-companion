import type { Clipboard } from "electron";
import { App, EventRef, Events, ObsidianProtocolHandler } from "obsidian";
import { ObsidianProtocolData } from "obsidian";
import equal from "fast-deep-equal/es6";

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
  info?: CbInfo | UrlInfo;

  lastValue: string | ObsidianProtocolData | null = null;
  init = true;

  /**
   * @param immediate emit event immediately after calling start()
   */
  constructor(
    private app: App,
    public timeInterval = 500,
    public immediate = false,
  ) {
    super();
    if (app.isMobile) {
      this.info = { autoPasteRef: null, paramsCache: null };
      /** insert recieved flag to clipboard and save val to cache */

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
    } else {
      import("electron")
        .then((e) => (this.info = { instance: e.clipboard, intervalId: 0 }))
        .catch((reason) => console.error(reason));
    }
  }

  private checkInit(
    action: (() => void) | null,
    actionMobile?: (url: UrlInfo) => void,
    actionDesktop?: (clipboard: CbInfo) => void,
  ): void {
    if (this.info === undefined) {
      console.error("Call InputListener before init");
    } else {
      action && action();
      if (isCbInfo(this.info)) actionDesktop && actionDesktop(this.info);
      else actionMobile && actionMobile(this.info);
    }
  }

  private _watching = false;
  public get autoPaste(): boolean {
    return this._watching;
  }
  public set autoPaste(v: boolean) {
    this.checkInit(() => {
      v ? this.start() : this.stop();
    });
  }

  // refs: EventRef[] = [];
  on(
    name: "url-recieved",
    callback: (params: ObsidianProtocolData) => void,
  ): EventRef;
  on(name: "changed", callback: (val: NonNullable<InputListener["lastValue"]>) => void): EventRef;
  on(name: string, callback: (...data: any) => any, ctx?: any): EventRef {
    const ref = super.on(name, callback, ctx);
    // this.refs.push(ref);
    return ref;
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
    const desktop = (clipboard: CbInfo) => {
        if (clipboard.intervalId !== 0) return;
        this.init = true;
        clipboard.intervalId = window.setInterval(
          () => this.tryTriggerChange(clipboard.instance.readText()),
          this.timeInterval,
        );
      },
      mobile = (url: UrlInfo) => {
        url.autoPasteRef = this.on("url-recieved", this.onRecieve_AutoPaste);
      };
    this.checkInit(null, mobile, desktop);
  }
  tryTriggerChange = (value: NonNullable<InputListener["lastValue"]>) => {
    if (!equal(value, this.lastValue)) {
      this.lastValue = value;

      if (this.immediate || !this.init) {
        this.trigger("changed", value);
      }
      if (this.init) this.init = false;
    }
  };
  onRecieve_AutoPaste: ObsidianProtocolHandler = (params) =>
    this.tryTriggerChange(params);

  /**
   * Stop watching
   */
  stop(): void {
    this._watching = false;
    const desktop = (clipboard: CbInfo) => {
        if (clipboard.intervalId !== undefined) {
          clearInterval(clipboard.intervalId);
          clipboard.intervalId = 0;
          // this.refs.forEach((ref) => this.offref(ref));
          this.lastValue = null;
        }
      },
      mobile = (url: UrlInfo) => {
        url.autoPasteRef && this.offref(url.autoPasteRef);
        url.autoPasteRef = null;
      };
    this.checkInit(null, mobile, desktop);
  }
}
