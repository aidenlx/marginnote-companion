// https://github.com/venomaze/clipboard-listener

import events from "events";
import { clipboard } from "electron";

interface EventListener {
  (v: string): void;
}

export default class ClipboardListener {
  eventEmitter = new events.EventEmitter();
  timeInterval = 500;
  immediate = false;
  interval: ReturnType<typeof setInterval> | undefined;
  lastValue: string | null = null;
  private isWatching = false;
  listener: EventListener = (v) => {};
  init = true;

  public get Watching(): boolean {
    return this.isWatching;
  }

  public set Watching(v: boolean) {
    if (v) {
      this.listen();
    } else {
      this.stop();
    }
  }

  /**
   * Create an event emitter and start watching
   * @param options Custom options object (optional)
   */
  constructor(timeInterval?: number, immediate?: boolean) {
    if (timeInterval) {
      this.timeInterval = timeInterval;
    }
    if (immediate) {
      this.immediate = immediate;
    }
  }

  /**
   * Start watching for the clipboard changes
   */
  private watch(): void {
    if (!this.isWatching) {
      this.isWatching = true;
    }

    this.interval = setInterval(() => {
      const value = clipboard.readText();
      if (value !== this.lastValue) {
        if (this.immediate || !this.init) {
          this.eventEmitter.emit("change", value);
        }

        if (this.init) this.init = false;

        this.lastValue = value;
      }
    }, this.timeInterval);
  }

  /**
   * Start watching and listening again
   * @returns Returns event emitter listener if it wasn't watching already
   */
  listen(listener?: EventListener) {
    if (!this.isWatching) {
      this.init = true;
      this.watch();
      if (listener) this.listener = listener;
      if (this.listener) return this.eventEmitter.on("change", this.listener);
    }
    return null;
  }

  /**
   * Stop listening and watching
   */
  stop(): void {
    if (this.isWatching) {
      this.isWatching = false;
      if (this.interval) clearInterval(this.interval);
      this.eventEmitter.removeAllListeners();
      this.lastValue = null;
    }
  }
}
