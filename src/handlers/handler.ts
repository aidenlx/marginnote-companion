import { ReturnBody } from "@aidenlx/obsidian-bridge";
import { JsonToObj, UrlToObj } from "@aidenlx/obsidian-bridge";
import assertNever from "assert-never";
import { Editor, ObsidianProtocolData } from "obsidian";

import handleNote, { NoteImportOption } from "./handle-note";
import handleSel from "./handle-sel";
import handleToc from "./handle-toc";

/**
 * @returns if the function completed successfully
 */
export const handleMNData = (
  src: string | ObsidianProtocolData,
  cm: CodeMirror.Editor | Editor,
  noteOptions: NoteImportOption,
): boolean => {
  const result = getMNData(src);
  if (!result) return false;

  const [, body] = result;
  switch (body.type) {
    case "sel":
      return handleSel(body, cm);
    case "note":
      return handleNote(body, cm, noteOptions);
    case "toc":
      return handleToc();
    default:
      assertNever(body);
  }
};

/**
 * @returns null if invaild
 */
export const getMNData = (
  src: string | ObsidianProtocolData,
): [version: string, body: ReturnBody] | null =>
  typeof src === "string" ? JsonToObj(src) : UrlToObj(src);
