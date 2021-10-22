import Link from "./link";
import Text from "./text";

export default class Comment {
  private srcLink: Link | undefined = undefined;
  constructor(
    private content: Text | string | Link | undefined,
    srcNoteId?: string,
  ) {
    if (srcNoteId) this.srcLink = Link.getInst({ id: srcNoteId });
  }

  get isRegular(): true {
    return true;
  }
  get Process() {
    if (this.content instanceof Text) this.content.Process;
    return this.content;
  }
  get Text(): Text | undefined {
    return this.content instanceof Text ? this.content : undefined;
  }
  get Link(): Link | undefined {
    return this.content instanceof Link ? this.content : undefined;
  }
  get Media(): string | undefined {
    return typeof this.content === "string" ? this.content : undefined;
  }
  get SrcLink(): Link | undefined {
    return (
      this.srcLink ?? (this.content instanceof Link ? this.content : undefined)
    );
  }

  toString(): string {
    return this.content?.toString() ?? "";
  }
}
