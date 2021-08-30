import { Book, Note, ReturnBody_Note } from "@aidenlx/obsidian-bridge";
import {
  excerptPic,
  excerptPic_video,
  linkComment,
  linkComment_pic,
  noteComment,
} from "@alx-plugins/marginnote";
import assertNever from "assert-never";
import replaceAsync from "string-replace-async";

import { WithUndefined } from "../misc";
import MNComp from "../mn-main";
import AddNewVideo from "./add-new-video";
import { getLink, Link, Text } from "./basic";
import Template from "./template";

type PHValMap<T extends string> = Record<T, string | undefined>;

type Partials = Record<"Excerpt" | "Comments", string>;

/**
 * for comments, use {{> Comments}}; for excerpt, use {{> Excerpt}}; for title with heading level, use {{Title.1}}
 */
type BodyRec = PHValMap<"Created" | "Modified" | "FilePath" | "DocTitle"> &
  WithUndefined<{
    Excerpt: ExcerptRec;
    Comments: CommentRec[];
    RawTitle: string;
    Title: string;
    Aliases: string;
    Link: Link;
  }>;

type CommentRec = WithUndefined<{ Media: string; Text: Text; Link: Link }>;
type ExcerptRec = PHValMap<"Media"> & WithUndefined<{ Text: Text }>;

const isVideo = (
  pic: excerptPic | excerptPic_video | undefined,
): pic is excerptPic_video => !!(pic as excerptPic_video)?.video;
const isPic = (
  pic: excerptPic | excerptPic_video | undefined,
): pic is excerptPic => !!pic && !(pic as excerptPic_video).video;
const isLC_pic = (lc: linkComment): lc is linkComment_pic =>
  (lc as linkComment_pic).q_hpic !== undefined;

type timeSpan = [start: string | undefined, end: string | undefined];
export default class NoteTemplate extends Template<"note"> {
  constructor(plugin: MNComp) {
    super(plugin, "note");
  }
  private getExcerpt(
    note: Note,
    mediaMap: Record<string, string>,
  ): ExcerptRec | undefined {
    const { excerptText, excerptPic, startPos, endPos } = note;
    if (!excerptText && !excerptPic) return undefined;
    return {
      Media: this.getExcerptMediaPH(excerptPic, mediaMap, [startPos, endPos]),
      Text: this.getText(excerptText),
    };
  }
  private getComments(body: ReturnBody_Note): CommentRec[] | undefined {
    const { mediaMap, linkedNotes } = body,
      { comments } = body.data;
    if (!comments || comments.length === 0) return undefined;

    return comments.map<CommentRec>((c) => {
      const getObj = (obj: Partial<CommentRec>): CommentRec => ({
        Media: undefined,
        Text: undefined,
        Link: undefined,
        ...obj,
      });
      switch (c.type) {
        case "TextNote": // LinkedNote (mnUrl in c.text) or comment
          return c.text?.startsWith("marginnote3app")
            ? getObj({ Link: getLink(c.text) })
            : getObj({ Text: this.getText(c.text) });
        case "HtmlNote": // if with noteid: from merged note
          return getObj({
            Text: this.getText(c.html, true),
          });
        case "PaintNote":
          return getObj({
            Media: c.paint ? getPlaceholder("pic", c.paint) : undefined,
          });
        case "LinkNote": {
          // Merged Note
          let timeSpan: timeSpan | undefined = undefined;
          if (isLC_pic(c) && isVideo(c.q_hpic)) {
            const srcNote = linkedNotes[c.noteid];
            if (srcNote) timeSpan = [srcNote.startPos, srcNote.endPos];
            else {
              console.error(
                "Cannot find merged note %s in %o while fetching timeSpan for video",
                c.noteid,
                linkedNotes,
                body,
              );
            }
          }

          return getObj({
            Link: getLink({ id: c.noteid, linkTo: "note" }),
            Text: this.getText(c.q_htext),
            Media: isLC_pic(c)
              ? this.getExcerptMediaPH(c.q_hpic, mediaMap, timeSpan)
              : undefined,
          });
        }
        default:
          assertNever(c);
      }
    });
  }
  private getBody(
    note: Note,
    bookMap: Record<string, Book>,
    mediaMap: Record<string, string>,
    refCallback?: (refSource: string) => any,
  ): Omit<BodyRec, "Comments"> {
    const { noteTitle, createDate, modifiedDate, docMd5, noteId } = note,
      book = getBook(docMd5, bookMap);
    return {
      RawTitle: noteTitle,
      ...getTitleAliasesProps(noteTitle),
      Created: this.formatDate(createDate),
      Modified: this.formatDate(modifiedDate),
      Link: getLink({ id: noteId, linkTo: "note" }, undefined, refCallback),
      FilePath: book?.pathFile,
      DocTitle: book?.docTitle,
      Excerpt: this.getExcerpt(note, mediaMap),
    };
  }

  /**
   * @param refCallback if not given, insert refSource to bottom of rendered text
   */
  async render(
    body: ReturnBody_Note,
    refCallback?: (refSource: string) => any,
  ): Promise<string> {
    const { bookMap, mediaMap } = body;
    let refSource = "";
    refCallback = refCallback ?? ((ref: string) => (refSource = ref));

    const view: BodyRec = {
        ...this.getBody(body.data, bookMap, mediaMap, refCallback),
        Comments: this.getComments(body),
      },
      comment = this.template.comment.replace(/{{\s*>\s*Comments\s*}}/g, ""),
      excerpt = this.template.excerpt.replace(/{{\s*>\s*Excerpt\s*}}/g, ""),
      parital: Partials = {
        Excerpt: `{{#Excerpt}}${excerpt}{{/Excerpt}}`,
        Comments: `{{#Comments}}${comment}{{/Comments}}`,
      };
    let rendered = this.renderTemplate(this.template.body, view, parital);

    if (refSource) {
      rendered += Link.getToInsertLast(rendered, refSource);
    }
    return this.importAttachments(rendered, body);
  }

  /** get placeholder for media in excerpt */
  getExcerptMediaPH(
    excerptPic: excerptPic | excerptPic_video | undefined,
    mediaMap: Record<string, string>,
    timeSpan?: timeSpan,
  ): string | undefined {
    if (!excerptPic) return undefined;
    else if (isPic(excerptPic) && mediaMap[excerptPic.paint]) {
      return getPlaceholder("pic", excerptPic.paint);
    } else if (isVideo(excerptPic)) {
      const { video: videoMd5, paint: SnapshotMd5 } = excerptPic,
        getHash = () => {
          if (!timeSpan) return "";
          const [start, end] = timeSpan.map(videoPosToSec);
          return `#t=${start}${end ? "," + end : ""}`;
        };
      return getPlaceholder("video", videoMd5, getHash(), SnapshotMd5);
    } else return undefined;
  }

  async importAttachments(
    rendered: string,
    body: ReturnBody_Note,
  ): Promise<string> {
    const { mediaMap, bookMap } = body,
      getPicLink = async (data: string, subpath?: string, alias?: string) => {
        const file = await this.saveAttachment(data, getAttName(body), "png");
        if (!file) return undefined;
        return this.getFileLink(file, true, subpath, alias);
      };

    return replaceAsync(rendered, PHRegex, async (_match, type, paramStr) => {
      let data: string;
      if (typeof type === "string" && typeof paramStr === "string") {
        const params = paramStr.split("|");
        if (
          type === "pic" &&
          params.length === 1 &&
          (data = mediaMap[params[0]])
        ) {
          return (await getPicLink(data)) ?? _match;
        } else if (type === "video" && params.length === 3) {
          const [videoMd5, hash, SnapshotMd5] = params,
            srcName = getBook(videoMd5, bookMap)?.docTitle ?? "Unknown Video",
            target = await new AddNewVideo(
              this.plugin,
              srcName,
              videoMd5,
            ).getLink();
          if (target) {
            if (typeof target === "string")
              return `![${srcName}](${target}${hash})`;
            else {
              return this.getFileLink(target, true, hash);
            }
          } else if ((data = mediaMap[SnapshotMd5])) {
            // fallback to snapshot
            return (await getPicLink(data, hash)) ?? _match;
          }
        }
      }
      console.error("unexpected match, skipping...", _match, type, paramStr);
      return _match;
    });
  }
}

const PHRegex = /<!--(pic|video):(.+?)-->/g;
const getPlaceholder = (
  ...args:
    | [type: "pic", md5: string]
    | [type: "video", videoMd5: string, hash: string, SnapshotMd5: string]
) => {
  const [type, ...data] = args;
  return `<!--${type}:${data.join("|")}-->`;
};

export const getTitleAliases = (
  raw: string,
): [title: string, aliases: string[]] => {
  const [title, ...aliases] = raw.split(/[;；]/);
  return [title, aliases];
};
const getTitleAliasesProps = (
  raw: string | undefined,
): Pick<BodyRec, "Title" | "Aliases"> => {
  if (raw) {
    const [title, aliases] = getTitleAliases(raw);
    return {
      Title: title,
      Aliases: aliases.length === 0 ? undefined : `[${aliases.join(", ")}]`,
    };
  } else
    return {
      Title: undefined,
      Aliases: undefined,
    };
};

const getBook = (
  md5: string | undefined,
  map: Record<string, Book> | undefined,
) => (md5 && map ? map[md5] : undefined);

const getAttName = (body: ReturnBody_Note): string => {
  const date = "YYYYMMDDHHmmss",
    { bookMap } = body,
    { noteTitle, excerptText, excerptPic, createDate, docMd5 } = body.data,
    getBookCTime = () => {
      const name = getBook(docMd5, bookMap)?.docTitle,
        ctime = createDate;
      if (name && ctime) return `${name} ${window.moment(ctime).format(date)}`;
      else return null;
    };
  return (
    noteTitle ??
    excerptText?.substring(10) ??
    getBookCTime() ??
    excerptPic?.paint ??
    "MarginNote " + window.moment().format(date)
  );
};

const videoPosToSec = (pos: string | undefined): number | undefined => {
  if (!pos || typeof pos !== "string") return undefined;
  const [mark, totalStr, propStr, ...others] = pos.split("|"),
    total = +totalStr,
    prop = +propStr;
  if (
    mark === "MN3VIDEO" &&
    others.length === 0 &&
    Number.isFinite(total) &&
    Number.isFinite(prop) &&
    total > 0 &&
    prop >= 0 &&
    prop <= 1
  )
    return total * prop;
  else {
    console.error("invalid MNVIDEO time: ", pos);
    return undefined;
  }
};
