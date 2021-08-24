import { Editor, ObsidianProtocolData } from "obsidian";
import assertNever from "assert-never";
import handleSel from "./handleSel";
import handleNote, { NoteImportOption } from "./handleNote";
import { ReturnBody } from "@aidenlx/obsidian-bridge";
import { JsonToObj, UrlToObj } from "@aidenlx/obsidian-bridge";
import handleToc from "./handleToc";

/**
 * @returns if the function completed successfully
 */
export function handleMNData(
  src: string | ObsidianProtocolData,
  cm: CodeMirror.Editor | Editor,
  noteOptions: NoteImportOption,
): boolean {
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
}

/**
 * @returns null if invaild
 */
export const getMNData = (
  src: string | ObsidianProtocolData,
): [version: string, body: ReturnBody] | null =>
  typeof src === "string" ? JsonToObj(src) : UrlToObj(src);
