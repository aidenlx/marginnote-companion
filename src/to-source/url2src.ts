import { Editor } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";

const url2src = async (editor: Editor) => {
  const addUrlToSrc = (name: string, url: URL) =>
    addToFrontmatter("sources", { [name]: url.toString() }, editor);
  try {
    let url = new URL(await navigator.clipboard.readText());
    if (url.hostname.endsWith("wikipedia.org")) {
      addUrlToSrc("wiki", url);
    } else {
      throw new Error("No match for hostname: " + url.hostname);
    }
  } catch (error) {
    return false;
  }
  return true;
};
export default url2src;
