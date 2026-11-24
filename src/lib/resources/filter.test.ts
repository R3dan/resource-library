import { describe, expect, it } from "vitest";

import { applyFilters, EMPTY_FILTERS } from "./filter";
import { toResourceCreate, EMPTY_FORM } from "./form";
import { resourceType } from "./schema";
import { buildSeed } from "./seed";

const { resources } = buildSeed();
const titles = (f: Partial<typeof EMPTY_FILTERS>) =>
  applyFilters(resources, { ...EMPTY_FILTERS, ...f }).map((r) => r.title);

describe("applyFilters", () => {
  it("limits results to the requested resource type", () => {
    const books = applyFilters(resources, { ...EMPTY_FILTERS, type: "book" });
    expect(books).toHaveLength(4);
    expect(books.every((r) => resourceType(r) === "book")).toBe(true);
  });

  it("matches the search text against author names", () => {
    expect(titles({ q: "hickey" })).toEqual(["Simple Made Easy"]);
  });

  it("filters by status", () => {
    expect(titles({ status: "abandoned" })).toEqual(["Things You Should Never Do, Part I"]);
  });

  it("filters by topic, subtopic, tag and collection ids together", () => {
    // topic 2 = Software engineering, subtopic 3 = Simplicity, tag 4 = essay
    expect(titles({ topic: 2, subtopic: 3, tag: 4 })).toEqual(["Choose Boring Technology"]);
    // collection 3 = Watch later
    expect(titles({ collection: 3 }).sort()).toEqual(["Inventing on Principle", "The Mother of All Demos"]);
  });

  it("filters books by publisher and excludes other types", () => {
    expect(titles({ publisher: "Basic Books" })).toEqual(["The Design of Everyday Things"]);
  });

  it("sorts by rating with unrated resources last", () => {
    const ratings = applyFilters(resources, { ...EMPTY_FILTERS, sort: "rating" }).map((r) => r.rating);
    expect(ratings[0]).toBe(94);
    expect(ratings.at(-1)).toBeNull();
  });
});

describe("toResourceCreate", () => {
  it("only fills the subtype object for the chosen type and nulls blanks", () => {
    const body = toResourceCreate("video", {
      ...EMPTY_FORM,
      title: "  A talk ",
      platform: "YouTube",
      duration_minutes: "42",
    });
    expect(body.title).toBe("A talk");
    expect(body.video).toEqual({ platform: "YouTube", channel: null, transcript_url: null });
    expect(body.book).toBeNull();
    expect(body.article).toBeNull();
    expect(body.duration_minutes).toBe(42);
    expect(body.page_count).toBeNull();
    expect(body.status).toBe("to_read");
  });
});
