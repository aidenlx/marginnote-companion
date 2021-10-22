import { Book, Note, ReturnBody_Note } from "@aidenlx/obsidian-bridge";
import {
  excerptPic,
  excerptPic_video,
  linkComment_pic,
} from "@alx-plugins/marginnote";
import assertNever from "assert-never";
import replaceAsync from "string-replace-async";

import AddNewVideo from "../handlers/add-new-video";
import { AddForEachProp, getBookFromMap, NonTypeProps, toPage } from "../misc";
import MNComp from "../mn-main";
import Comment from "./basic/comment";
import Excerpt from "./basic/excerpt";
import Link from "./basic/link";
import Query from "./basic/query";
import Template, { getViewKeys, PHValMap } from "./template";

type Partials = Record<"Comments" | "CmtBreak", string>;

/**
 * for comments, use {{> Comments}}; for excerpt, use {{> Excerpt}}; for title with heading level, use {{Title.1}}
 */
type BodyRec = PHValMap<
  "Created" | "Modified" | "FilePath" | "DocTitle" | "DocMd5"
> &
  AddForEachProp<{
    Excerpt: Excerpt;
    Comments: CommentRec[];
    RawTitle: string;
    Title: string;
    Aliases: string;
    Link: Link;
    Query: Query;
  }>;

type CommentRec =
  | Comment
  | { Excerpt: Excerpt | undefined; Link: Link | undefined };

export const NoteViewKeys = {
  partial: getViewKeys<keyof Partials>({
    CmtBreak: null,
    Comments: null,
  }),
  body: getViewKeys<Exclude<keyof BodyRec, "Comments">>({
    Created: null,
    Modified: null,
    FilePath: null,
    DocTitle: null,
    DocMd5: null,
    RawTitle: null,
    Title: null,
    Aliases: null,
    Link: null,
    Excerpt: null,
    Query: null,
  }),
  cmt_linked: getViewKeys<keyof Exclude<CommentRec, Comment>>({
    Excerpt: null,
    Link: null,
  }),
  comment: getViewKeys<keyof NonTypeProps<Comment, Function | boolean>>({
    Process: null,
    Text: null,
    Media: null,
    SrcLink: null,
    Link: null,
  }),
};

const isVideo = (
  pic: excerptPic | excerptPic_video | undefined,
): pic is excerptPic_video => !!(pic as excerptPic_video)?.video;
const isPic = (
  pic: excerptPic | excerptPic_video | undefined,
): pic is excerptPic => !!pic && !(pic as excerptPic_video).video;

type timeSpan = [start: string | undefined, end: string | undefined];
export default class NoteTemplate extends Template<"note"> {
  constructor(plugin: MNComp) {
    super(plugin, "note");
  }
  private getExcerpt(
    excerpt: {
      textBak?: string | undefined;
      picBak?: excerptPic | excerptPic_video | undefined;
      note: Note | undefined;
    },
    mediaMap: Record<string, string>,
  ): Excerpt {
    const { textBak, picBak } = excerpt,
      {
        startPos,
        endPos,
        textFirst,
        excerptPic: pic,
        excerptText: text,
      } = excerpt.note ?? {};
    return new Excerpt(
      textFirst ?? false,
      this.getText(text ?? textBak),
      this.getExcerptMediaPH(pic ?? picBak, mediaMap, [startPos, endPos]),
    );
  }
  private getComments(body: ReturnBody_Note): CommentRec[] | undefined {
    const { mediaMap, linkedNotes } = body,
      { comments } = body.data;
    if (!comments || !Array.isArray(comments) || comments.length === 0)
      return undefined;
    return comments.map<CommentRec>((c) => {
      switch (c.type) {
        case "TextNote": // LinkedNote (mnUrl in c.text) or comment
          return c.text?.startsWith("marginnote3app")
            ? new Comment(Link.getInst(c.text), c.noteid)
            : new Comment(this.getText(c.text), c.noteid);
        case "HtmlNote": // if with noteid: from merged note
          return new Comment(this.getText(c.html, true), c.noteid);
        case "PaintNote": {
          let placeholder = undefined;
          if (c.paint) placeholder = getPlaceholder("pic", c.paint);
          else if (c.strokes) placeholder = "%% Some handwrittings %%";

          return new Comment(placeholder, c.noteid);
        }
        case "LinkNote":
          // Merged Note
          if (!linkedNotes[c.noteid]) {
            console.error(
              "Cannot find merged note %s in %o while fetching timeSpan for video",
              c.noteid,
              linkedNotes,
              body,
            );
          }

          return {
            Excerpt: this.getExcerpt(
              {
                note: linkedNotes[c.noteid],
                picBak: (c as linkComment_pic).q_hpic,
                textBak: c.q_htext,
              },
              mediaMap,
            ),
            Link: Link.getInst({ id: c.noteid }),
          };
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
    const Page = toPage(note),
      { noteTitle, createDate, modifiedDate, docMd5: DocMd5, noteId } = note,
      { docTitle: DocTitle, pathFile: FilePath } = getBookFromMap(
        DocMd5,
        bookMap,
      );
    return {
      RawTitle: noteTitle,
      ...getTitleAliasesProps(noteTitle),
      Created: this.formatDate(createDate),
      Modified: this.formatDate(modifiedDate),
      Link: Link.getInst({ id: noteId }, undefined, refCallback),
      FilePath,
      DocTitle,
      DocMd5,
      Excerpt: this.getExcerpt({ note }, mediaMap),
      Query: new Query({ Page, DocMd5, DocTitle, FilePath }),
    };
  }

  prerender(
    body: ReturnBody_Note,
    tplName: string,
    refCallback?: (refSource: string) => any,
  ): string {
    const templates = this.getTemplate(tplName);

    const { bookMap, mediaMap } = body;
    let refSource = "";
    refCallback = refCallback ?? ((ref: string) => (refSource = ref));

    const view: BodyRec = {
        ...this.getBody(body.data, bookMap, mediaMap, refCallback),
        Comments: this.getComments(body),
      },
      parital: Partials = {
        Comments:
          "{{#Comments}}" +
          `{{#isRegular}}${templates.comment}{{/isRegular}}` +
          `{{^isRegular}}${templates.cmt_linked}{{/isRegular}}` +
          "{{/Comments}}",
        CmtBreak: "{{#Comments.length}}\n\n\n{{/Comments.length}}",
      };
    let rendered: string;
    try {
      rendered = this.renderTemplate(templates.body, view, parital);
    } catch (error) {
      throw this.RenderError(error, tplName);
    }
    if (refSource) {
      rendered += Link.getToInsertLast(rendered, refSource);
    }
    return rendered;
  }
  /**
   * @param refCallback if not given, insert refSource to bottom of rendered text
   */
  render(...args: Parameters<NoteTemplate["prerender"]>): Promise<string> {
    let prerender = this.prerender(...args);
    try {
      return this.importAttachments(prerender, args[0]);
    } catch (error) {
      throw this.RenderError(error, args[1]);
    }
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
          if (!timeSpan || timeSpan.every((t) => !t)) return "";
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
      getPicLink = async (
        id: string,
        data: string,
        subpath?: string,
        alias?: string,
      ) => {
        const file = await this.saveAttachment(data, id, "png");
        if (!file) return undefined;
        return this.getFileLink(file, true, subpath, alias);
      };

    return replaceAsync(rendered, PHRegex, async (_match, type, paramStr) => {
      let data: string;
      if (typeof type === "string" && typeof paramStr === "string") {
        const params = paramStr.split("|");
        if (type === "pic" && params.length === 1) {
          const [picMd5] = params;
          if ((data = mediaMap[picMd5]))
            return (await getPicLink(picMd5, data)) ?? _match;
        } else if (type === "video" && params.length === 3) {
          const [videoMd5, hash, SnapshotMd5] = params,
            srcName =
              getBookFromMap(videoMd5, bookMap).docTitle ?? "Unknown Video",
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
            return (await getPicLink(SnapshotMd5, data, hash)) ?? _match;
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

const getAttName = (id: string | undefined): string => {
  const date = "YYYYMMDDHHmmss";
  return id ?? "MarginNote " + window.moment().format(date);
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
