import { DataObject as mdObj } from "json2md";
import { toMDObjs, transformBasicNote_Body, transformBasicNote_Title, transformComments, transformFullNote_Body, transformFullNote_Title } from "./transform";

const p = (str: string, ...strs: string[]): mdObj => {
  if (strs.length > 0) {
    return {
      p: [str, ...strs],
    };
  } else {
    return {
      p: str,
    };
  }
};

describe("toMDObjs merge funtion", () => {
  test("falsy objects", () => {
    expect(toMDObjs(null)).toEqual([]);
    expect(toMDObjs(undefined)).toEqual([]);
    expect(toMDObjs(null)).toEqual([]);
    expect(toMDObjs(null, "string")).toEqual([p("string")]);
    expect(toMDObjs(undefined, "string")).toEqual([p("string")]);
    expect(toMDObjs("test", null)).toEqual([p("test")]);
    expect(toMDObjs("test", undefined)).toEqual([p("test")]);
    expect(toMDObjs("test", null, "string")).toEqual([
      p("test", "string"),
    ]);
    expect(toMDObjs("test", undefined, "string")).toEqual([
      p("test", "string"),
    ]);
  });
  test("merge adjacent paragraphs", () => {
    expect(toMDObjs("hello","there")).toEqual([p("hello","there")]);
    expect(toMDObjs(p("hello"),"there")).toEqual([p("hello","there")]);
    expect(toMDObjs("hello",p("there"))).toEqual([p("hello","there")]);

    expect(toMDObjs(p("hello","there"),p("123"))).toEqual([p("hello","there","123")]);
    expect(toMDObjs(p("123"),p("hello","there"))).toEqual([p("123","hello","there")]);

    // const nested = [
    //   [p("hello"), p("there", "123")],
    //   p(";"),
    //   p("hello", "again"),
    // ];

    // expect(toMDObjs(nested)).toEqual([
    //   p("hello", "there", "123", ";", "hello", "again"),
    // ]);

  })
});


// const testComments = [
//   {
//     "type": "TextNote",
//     "text": "MarginNote 学习方法: 碎片化 + 网络化 + 重复化 = 内化"
//   },
//   {
//     "text": "摘录笔记+思维导图+记忆卡片 三位一体",
//     "rtf": {},
//     "type": "HtmlNote",
//     "html": "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n<html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n<meta http-equiv=\"Content-Style-Type\" content=\"text/css\">\n<title></title>\n<meta name=\"Generator\" content=\"Cocoa HTML Writer\">\n<meta name=\"CocoaVersion\" content=\"1671.4\">\n<style type=\"text/css\">\np.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px 'PingFang SC'; color: #1e242b}\nspan.s1 {font: 14.0px Helvetica}\n</style>\n</head>\n<body>\n<p class=\"p1\">摘录笔记<span class=\"s1\">+</span>思维导图<span class=\"s1\">+</span>记忆卡片<span class=\"s1\"> </span>三位一体</p>\n</body>\n</html>\n",
//     "htmlSize": {}
//   },
//   {
//     "paint": "f4c702cdca75a9292d7293c77def77e6",
//     "size": {},
//     "type": "PaintNote"
//   },
//   {
//     "type": "LinkNote",
//     "noteid": "CFF83462-FF02-423D-A08E-37AD9C371078",
//     "q_htext": "以文本内容为载体、以知识内化为主打功能的阅读应用"
//   }
// ]

// describe("transformComments function", () => {
//   test("transform different types: basic",()=>{
//     expect(transformComments([  {
//       "type": "TextNote",
//       "text": "MarginNote 学习方法: 碎片化 + 网络化 + 重复化 = 内化"
//     }],false)).toEqual([p("MarginNote 学习方法: 碎片化 + 网络化 + 重复化 = 内化")]);
    
//     expect(transformComments([{
//       "text": "摘录笔记+思维导图+记忆卡片 三位一体",
//       "rtf": {},
//       "type": "HtmlNote",
//       "html": "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n<html>\n<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n<meta http-equiv=\"Content-Style-Type\" content=\"text/css\">\n<title></title>\n<meta name=\"Generator\" content=\"Cocoa HTML Writer\">\n<meta name=\"CocoaVersion\" content=\"2022.44\">\n<style type=\"text/css\">\np.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 16.0px 'PingFang SC'; color: #1e242b}\nspan.s1 {font: 16.0px 'Avenir Next'}\n</style>\n</head>\n<body>\n<p class=\"p1\">&#x6458;&#x5F55;&#x7B14;&#x8BB0;<span class=\"s1\"> =<b> </b></span><b>&#x788E;&#x7247;&#x5316;</b><span class=\"s1\"><b><span class=\"Apple-converted-space\">&nbsp;</span></b></span></p>\n</body>\n</html>\n",
//       "htmlSize": {}
//     }],false)).toEqual([p("摘录笔记+思维导图+记忆卡片 三位一体")]);

//     expect(transformComments([{
//       "paint": "f4c702cdca75a9292d7293c77def77e6",
//       "size": {},
//       "type": "PaintNote"
//     }],false)).toEqual([]);
//   expect(transformComments([{
//     "type": "LinkNote",
//     "noteid": "CFF83462-FF02-423D-A08E-37AD9C371078",
//     "q_htext": "以文本内容为载体、以知识内化为主打功能的阅读应用"
//   }],false)).toEqual([p("以文本内容为载体、以知识内化为主打功能的阅读应用")])
    
//   })
//   test("transform different types: full",()=>{
    
//   })
//   transformComments
// });

// describe("title transform", () => {
//   transformBasicNote_Title
//   transformFullNote_Title
// });

// describe("body transform", () => {
//   transformBasicNote_Body
//   transformFullNote_Body
// });