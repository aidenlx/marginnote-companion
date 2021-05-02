
const chs = /[\u4e00-\u9fa5]/g;

export const ExtractMNAlias = (mnAlias: string): string[] =>
  mnAlias.replace(/,/g, "_").split(";");


function cleanText(src: string) {
  return src
    .trim()                                   // 去除条目开头与结尾的多余空格
    .replace(/ {2,}/g, " ")                   // 多余空格处理
    .replace(/\B | \B/g, "")                  // 去除中文内空格和英文单词旁(非单词间)空格
    .replace(/([A-Z])\s*-\s*(?=[A-Z])/ig, "") // 英文连字符处理
}

export function ExtractDef(raw: string): string[] {

  raw = cleanText(raw);
  raw = raw
    .replace(/[.?!+·"。，？！—“”:：；;'<>]/g, "");
  
  return raw.split(/[,、()（）\/【】「」《》«»]+|或者?|[简又]?称(之?为)?/g).filter(e=>e);
}