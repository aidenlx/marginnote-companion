import { kebabCase } from "lodash-es";
import { stringify } from "query-string";

import { AddForEachProp } from "../../misc";

const QueryKeys = ["Page", "DocMd5", "DocTitle", "FilePath"] as const;
type QueryObjRaw = AddForEachProp<
  {
    Page: number[];
    DocMd5: string;
    DocTitle: string;
    FilePath: string;
  },
  undefined
>;
type QueryObj = Map<
  keyof QueryObjRaw,
  Exclude<QueryObjRaw[keyof QueryObjRaw], undefined>
>;
const qsConfig = { arrayFormat: "comma", sort: false } as const;
const CamelKeyToKebab = (items: QueryObj) => {
  const entries = items.entries(),
    convertIterator: typeof entries = {
      next: () => {
        let result = entries.next();
        if (result.value && typeof result.value[0] === "string")
          result.value[0] = kebabCase(result.value[0]);
        return result;
      },
      [Symbol.iterator]: function () {
        return this;
      },
    };
  return Object.fromEntries(convertIterator);
};

export default class Query {
  constructor(private raw: QueryObjRaw) {}
  private queryObj: QueryObj = new Map();
  private encode = false;

  private addToQuery(key: keyof QueryObjRaw) {
    let rawVal;
    (rawVal = this.raw[key]) && this.queryObj.set(key, rawVal);
  }

  get isEmpty(): boolean {
    for (const v of Object.values(this.raw)) {
      if (v !== undefined) return false;
    }
    return true;
  }

  get Encode(): Query {
    this.encode = true;
    return this;
  }

  get Page(): Query {
    this.addToQuery("Page");
    return this;
  }
  get DocMd5(): Query {
    this.addToQuery("DocMd5");
    return this;
  }
  get DocTitle(): Query {
    this.addToQuery("DocTitle");
    return this;
  }
  get FilePath(): Query {
    this.addToQuery("FilePath");
    return this;
  }

  toString(): string {
    if (this.queryObj.size === 0) {
      QueryKeys.forEach((k) => this.addToQuery(k));
    }
    return stringify(CamelKeyToKebab(this.queryObj), {
      ...qsConfig,
      encode: this.encode,
    });
  }
}
