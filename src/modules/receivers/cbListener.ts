import type { Clipboard } from "electron";
import { EventRef, Events } from "obsidian";

export default class ClipboardListener extends Events {
  intervalId?: number;
  lastValue: string | null = null;
  clipboard: Clipboard | null = null;
  init = true;
  /**
   * @param immediate emit event immediately after calling start()
   */
  constructor(public timeInterval = 500, public immediate = false) {
    super();
  }

  public get Watching(): boolean {
    return this.intervalId !== undefined;
  }
  public set Watching(v: boolean) {
    v ? this.start() : this.stop();
  }

  // refs: EventRef[] = [];
  on(name: "changed", callback: (str: string) => any, ctx?: any): EventRef {
    const ref = super.on(name, callback);
    // this.refs.push(ref);
    return ref;
  }
  trigger(name: "changed", str: string): void {
    super.trigger(name, str);
  }

  /**
   * Start watching for the clipboard changes
   */
  async start(): Promise<void> {
    if (!this.clipboard) {
      try {
        this.clipboard = (await import("electron")).clipboard;
      } catch (error) {
        console.error("fail to get clipboard from electron");
        throw new Error(error);
      }
    }
    const clipboard = this.clipboard as Clipboard;
    if (this.intervalId === undefined) {
      this.init = true;
      this.intervalId = window.setInterval(() => {
        const value = clipboard.readText();
        if (value !== this.lastValue) {
          this.lastValue = value;

          if (this.immediate || !this.init) {
            this.trigger("changed", value);
          }
          if (this.init) this.init = false;
        }
      }, this.timeInterval);
    }
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      // this.refs.forEach((ref) => this.offref(ref));
      this.lastValue = null;
    }
  }
}
