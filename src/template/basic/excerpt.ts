import Text from "./text";

export default class Excerpt {
  constructor(
    private textFirst: boolean,
    public Text: Text | undefined,
    public Pic: string | undefined,
  ) {}

  /** use processed text */
  get Process(): Excerpt {
    this.Text && this.Text.Process;
    return this;
  }
  get PicFirst(): Excerpt {
    this.textFirst = false;
    return this;
  }
  /** textFirst = true */
  get TextFirst(): Excerpt {
    this.textFirst = true;
    return this;
  }
  toString(): string {
    if (!this.Text && !this.Pic) return "";

    return (
      (this.textFirst ? this.Text ?? this.Pic : this.Pic ?? this.Text) as
        | Text
        | string
    ).toString();
  }
}
