import { Editor } from "obsidian";
import assertNever from "assert-never"
import { handleSel } from "./handleSel";
import { handleNote } from "./handleNote";
import { ReturnBody, MNMark } from "@alx-plugins/obsidian-bridge";

/**
 * 
 * @param src a json string from @alx-plugins/obsidian-bridge
 * @param cm 
 * @returns if the function completed successfully
 */
export function handleMNData(
  src: string,
  cm: CodeMirror.Editor | Editor
): boolean {

  const obj = isMNData(src);
  if (!obj) return false;
  
  switch (obj.type) {
    case "sel":
      return handleSel(obj,cm);
    case "note":
      return handleNote(obj,cm);
    default:
      assertNever(obj);
  }
}

/**
 * Determine if string is data from obsidian-bridge
 * @returns ReturnBody or null (if not MNData)  
 */
 export function isMNData(str: string): ReturnBody | null {
  if (str.startsWith(MNMark)) {
    const json = str.substring(MNMark.length);
    try {
      const obj = JSON.parse(json) as ReturnBody;
      return obj;
    } catch (error) {
      console.error(error);
      return null;
    }
  } else return null;
}
