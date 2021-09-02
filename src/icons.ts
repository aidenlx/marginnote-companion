import mnFill from "assets/mn-fill.svg";
import mnFillColor from "assets/mn-fill-color.svg";
import mnOutline from "assets/mn-outline.svg";
import type { addIcon } from "obsidian";

const NO_SVG_TAG = /<\/?svg([^>])*>/gm;

const icons = [
  ["mn-fill", mnFill],
  ["mn-fill-color", mnFillColor],
  ["mn-outline", mnOutline],
] as [id: string, svgRaw: string][];

icons.forEach((entry) => (entry[1] = entry[1].replace(NO_SVG_TAG, "")));

export default icons as Parameters<typeof addIcon>[];
