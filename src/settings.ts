import { cloneDeep } from "lodash-es";

import MNComp from "./mn-main";
import TemplateSettings, {
  ExtParams,
  Templates,
  TplCfgTypes,
} from "./typings/tpl-cfg";

export type MNCompSettings = {
  defaultDateFormat: string;
} & {
  [K in keyof PatchJSON]: PatchJSON[K]["src"];
};
interface VideoMapInfo {
  srcName: string;
  customName?: string;
  // Path/Url
  mapTo: string;
}

interface PatchJSON {
  [key: string]: { src: any; json: any };
  textPostProcess: {
    src: [search: RegExp, replace: string][];
    json: [pattern: string, searchFlags: string, replace: string][];
  };
  videoMap: {
    src: Map<string, VideoMapInfo>;
    json: Record<string, VideoMapInfo>;
  };
  templates: TemplateSettings;
}

export const DEFAULT_TPL_NAME = "default";

const getDefault = <T extends TplCfgTypes>(
  templates: Templates<T>,
  extra: ExtParams<T>,
) => ({
  cfgs: new Map([[DEFAULT_TPL_NAME, { templates, ...extra }]]),
});

export const DEFAULT_SETTINGS: MNCompSettings = {
  defaultDateFormat: "YY-MM-DD HH:mm",
  textPostProcess: [
    [/ {2,}/g, " "],
    [/(\d+?\.(?![\d]).+?) +?/g, "$1："],
    [/^[;,. ]+|[;,. ]+$|\B | \B/g, ""],
    [/;/g, "；"],
    [/,/g, "，"],
    [/([A-Za-z0-9])\s{0,}，\s{0,}(?=[A-Za-z0-9])/g, "$1,"],
    [/:/g, "："],
    [/〜/g, "~"],
    [/[“”„‟〝〞〟＂]/g, '"'],
  ],
  templates: {
    sel: getDefault<"sel">({ sel: "{{Selection}}" }, { pin: true }),
    note: getDefault<"note">(
      {
        body: "\n{{#Title}}\n## {{.}}\n\n{{/Title}}{{Excerpt}}{{Link}}{{> CmtBreak}}{{> Comments}}\n",
        comment: "> - {{.}}\n",
        cmt_linked: "> - {{Excerpt}}{{Link}}\n",
      },
      { pin: true },
    ),
    toc: getDefault<"toc">(
      {
        item: `- {{Summary}} {{Link}}`,
      },
      { pin: true, indentChar: true },
    ),
  },
  videoMap: new Map() as any,
};

const toJSONPatch = <K extends keyof PatchJSON>(
  obj: PatchJSON[K]["src"],
  key: K,
): PatchJSON[K]["src"] => {
  let input = obj as typeof obj & {
    toJSON: {
      (this: PatchJSON[K]["src"]): PatchJSON[K]["json"];
      manual_patch?: true;
    };
  };

  if (!input.toJSON || input.toJSON.manual_patch !== true) {
    input.toJSON = function (this: PatchJSON[K]["src"]) {
      return cvtFunc[key].toJSON(this);
    };
    input.toJSON.manual_patch = true;
  }

  return obj;
};

const cvtFunc: {
  [K in keyof PatchJSON]: {
    fromJSON: (json: PatchJSON[K]["json"]) => PatchJSON[K]["src"];
    toJSON: (src: PatchJSON[K]["src"]) => PatchJSON[K]["json"];
  };
} = {
  textPostProcess: {
    toJSON: (src) =>
      src.reduce((prev, arr) => {
        const [regex, replace] = arr;
        prev.push([regex.source, regex.flags, replace]);
        return prev;
      }, [] as PatchJSON["textPostProcess"]["json"]),
    fromJSON: (json) =>
      json.reduce((prev, arr) => {
        const [pattern, searchFlags, replace] = arr;
        prev.push([new RegExp(pattern, searchFlags), replace]);
        return prev;
      }, [] as PatchJSON["textPostProcess"]["src"]),
  },
  videoMap: {
    toJSON: (src) => Object.fromEntries(src),
    fromJSON: (json) => new Map(Object.entries(json)),
  },
  templates: {
    toJSON: (src) => {
      let newObj = cloneDeep(src) as typeof src;
      for (const t of Object.keys(src)) {
        const cfgType = t as keyof typeof src;
        for (const k of Object.keys(src[cfgType])) {
          const entry = src[cfgType],
            key = k as keyof typeof entry;
          if (key === "cfgs") {
            newObj[cfgType].cfgs = Object.fromEntries(src[cfgType].cfgs);
          }
        }
      }
      return newObj as any;
    },
    fromJSON: (json) => {
      for (const t of Object.keys(json)) {
        const cfgType = t as keyof typeof json;
        if (!DEFAULT_SETTINGS.templates[cfgType]) {
          console.log(
            "Unexpected template config type %s found, skipping",
            cfgType,
          );
          delete json[cfgType];
          continue;
        }
        for (const k of Object.keys(json[cfgType])) {
          const entry = json[cfgType],
            key = k as keyof typeof entry;
          if (key === "cfgs") {
            const map = new Map(Object.entries(json[cfgType].cfgs)),
              { templates } = DEFAULT_SETTINGS,
              defaultTpl = templates[cfgType].cfgs.get(DEFAULT_TPL_NAME);

            map.forEach((val, key) => {
              map.set(key, { ...defaultTpl, ...(val as any) });
            });
            // Add default template to json if not specified in config file
            if (!map.has(DEFAULT_TPL_NAME)) {
              map.set(DEFAULT_TPL_NAME, defaultTpl);
            }
            json[cfgType].cfgs = map as any;
          }
        }
      }
      return json as any;
    },
  },
};

export async function loadSettings(this: MNComp) {
  let json = await this.loadData();
  if (json) {
    for (const k in cvtFunc) {
      const key = k as keyof typeof cvtFunc,
        { fromJSON } = cvtFunc[key];
      if (json[key]) json[key] = fromJSON(json[key]);
    }
  }
  this.settings = { ...this.settings, ...json };
}

export async function saveSettings(this: MNComp) {
  let src = this.settings;
  for (const k in cvtFunc) {
    const key = k as keyof typeof cvtFunc;
    if (src[key]) src[key] = toJSONPatch(src[key], key);
  }
  await this.saveData(this.settings);
}
