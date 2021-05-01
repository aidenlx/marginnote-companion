import { excerptPic, MbBookNote, noteComment } from "@alx-plugins/marginnote";

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
  !(n as excerptNote).excerpt;
export const isExcerptOnly = (n: simpleNote): n is excerptOnly =>
  !(n as noteOnly).comments && !(n as noteOnly)?.title;
export const isExcerptNote = (n: simpleNote): n is excerptNote =>
  !(isNoteOnly(n) || isExcerptOnly(n));

/**
 * Get simplified MbBookNote
 * @returns simplified MbBookNote with all text unprocessed
 */
 export function getSimpleNote(src: MbBookNote): simpleNote {
  const {
    noteId: id,
    docMd5,
    noteTitle: title,
    comments,
    excerptText,
    excerptPic,
  } = src;
  if (!id || !docMd5) throw new Error("noteId或docMd5不存在");

  let note = { id, docMd5, title } as simpleNote;
  if (!comments || comments.length === 0)
    // @ts-ignore
    note.comments = comments;
  if (excerptText || excerptPic)
    // @ts-ignore
    note.excerpt = { text: excerptText, pic: excerptPic };
  if (isNoteOnly(note)) {
    note.type = "note";
  } else {
    if (isExcerptOnly(note)) {
      note.type = "excerpt";
    } else {
      note.type = "excerptNote";
    }
  }

  return note;
}