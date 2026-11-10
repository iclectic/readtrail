import { parseTagNames } from "../../src/domain/tags";

describe("parseTagNames", () => {
  test("splits and deduplicates exact strings", () => {
    expect(parseTagNames(" classics, favourites, classics , ")).toEqual([
      "classics",
      "favourites",
    ]);
  });
});
