import { Note } from "@aidenlx/obsidian-bridge";
import { excerptPic, noteComment } from "@alx-plugins/marginnote";

export type excerpt = ePic | eText;

/** text excerpt */
interface eText {
  text: string;
}
/** pic excerpt */
interface ePic {
  text?: string;
  pic: excerptPic;
}

export const is_ePic = (e: excerpt): e is ePic => (e as ePic).pic !== undefined;

// simpleNote

export type simpleNote = excerptNote | noteOnly | excerptOnly;

/**
 * 仅摘录
 */
export interface excerptOnly {
  type: "excerpt";
  pageRange?: [number, number] | number;
  id: string;
  docMd5: string;
  excerpt: excerpt;
}
/**
 * 仅笔记(comment/title)
 */
export interface noteOnly {
  type: "note";
  id: string;
  docMd5: string;
  title?: string;
  comments: noteComment[];
}
/**
 * 摘录+笔记(comment/title)
 */
export interface excerptNote {
  type: "excerptNote";
  pageRange?: [number, number] | number;
  id: string;
  docMd5: string;
  title?: string;
  comments: noteComment[];
  excerpt: excerpt;
}

export const isSimpleNote = (n: any): n is simpleNote =>
  (n as simpleNote)?.type !== undefined &&
  (n as simpleNote)?.id !== undefined &&
  (n as simpleNote)?.docMd5 !== undefined;

export const isNoteOnly = (n: simpleNote): n is noteOnly =>
  !(n as excerptNote).pageRange;
export const isExcerptOnly = (n: simpleNote): n is excerptOnly =>
  !(n as noteOnly).comments && !(n as noteOnly)?.title;
export const isExcerptNote = (n: simpleNote): n is excerptNote =>
  !isNoteOnly(n) && !isExcerptOnly(n);

/**
 * Get simplified MbBookNote
 * @returns simplified MbBookNote with all text unprocessed
 */
export const getSimpleNote = (src: Note): simpleNote => {
  let {
    noteId: id,
    startPage,
    endPage,
    docMd5,
    noteTitle: title,
    comments,
    excerptText,
    excerptPic,
  } = src;
  comments = comments ?? [];
  if (!id || !docMd5) throw new Error("noteId或docMd5不存在");

  if (startPage) {
    let excerpt: excerpt;
    if (excerptPic) excerpt = { text: excerptText, pic: excerptPic } as ePic;
    else excerpt = { text: excerptText } as eText;

    if (!startPage || !endPage) {
      console.error(src);
      throw new Error("missing page");
    }
    const pageRange: excerptNote["pageRange"] =
      startPage === endPage ? startPage : [startPage, endPage];

    if (title || (comments && comments.length !== 0))
      return {
        type: "excerptNote",
        id,
        docMd5,
        excerpt,
        comments,
        title,
        pageRange,
      };
    else return { type: "excerpt", id, docMd5, excerpt, pageRange };
  } else return { type: "note", comments, id, docMd5, title };
};
