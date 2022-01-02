import { Editor } from "obsidian";

import { addToFrontmatter } from "../handlers/frontmatter";

const url2src = async (editor: Editor) => {
  const addUrlToSrc = (id: string, url: URL) => {
    addToFrontmatter("sources", { [id]: url.toString() }, editor);
    let name;
    if ((name = url.pathname.split("/").last()?.replace(/[_-]/g, " "))) {
      addToFrontmatter("aliases", [name], editor);
    }
  };
  try {
    let url = new URL(await navigator.clipboard.readText());
    if (url.hostname.endsWith("wikipedia.org")) {
      addUrlToSrc("wiki", url);
    } else if (url.hostname.endsWith("radiopaedia.org")) {
      addUrlToSrc("radio", url);
    } else {
      throw new Error("No match for hostname: " + url.hostname);
    }
  } catch (error) {
    return false;
  }
  return true;
};
export default url2src;
