import { DataObject as mdObj } from "json2md";
import { toMDObjs } from "./transform";

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

    const nested = [
      [p("hello"), p("there", "123")],
      p(";"),
      p("hello", "again"),
    ];

    // expect(toMDObjs(nested)).toEqual([
    //   p("hello", "there", "123", ";", "hello", "again"),
    // ]);

  })
});


