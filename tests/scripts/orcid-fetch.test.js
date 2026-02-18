import { describe, it, expect, vi } from "vitest";
import {
  filterWorksByType,
  sortWorks,
  enrichWorks
} from "../../src/js/utils/orcid-fetch.js";

describe("ORCID Fetch Module", () => {
  describe("filterWorksByType", () => {
    const mockWorks = [
      { title: "Article", type: "journal-article" },
      { title: "Paper", type: "conference-paper" },
      { title: "Book", type: "book" },
      { title: "Other", type: "other" }
    ];

    it("returns all works when no filter is provided", () => {
      const result = filterWorksByType(mockWorks, []);
      expect(result).toHaveLength(4);
    });

    it("filters works by single type", () => {
      const result = filterWorksByType(mockWorks, ["journal-article"]);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("journal-article");
    });

    it("filters works by multiple types", () => {
      const result = filterWorksByType(mockWorks, ["journal-article", "conference-paper"]);
      expect(result).toHaveLength(2);
    });

    it("is case-insensitive", () => {
      const result = filterWorksByType(mockWorks, ["JOURNAL-ARTICLE"]);
      expect(result).toHaveLength(1);
    });

    it("returns empty array when no matches", () => {
      const result = filterWorksByType(mockWorks, ["nonexistent"]);
      expect(result).toHaveLength(0);
    });
  });

  describe("sortWorks", () => {
    const mockWorks = [
      { title: "First", type: "article", publicationDate: { year: { value: "2021" } } },
      { title: "Second", type: "article", publicationDate: { year: { value: "2023" } } },
      { title: "Third", type: "article", publicationDate: { year: { value: "2022" } } }
    ];

    it("sorts by date descending (default)", () => {
      const result = sortWorks(mockWorks);
      expect(result[0].publicationDate.year.value).toBe("2023");
      expect(result[2].publicationDate.year.value).toBe("2021");
    });

    it("sorts by date ascending", () => {
      const result = sortWorks(mockWorks, "date-asc");
      expect(result[0].publicationDate.year.value).toBe("2021");
      expect(result[2].publicationDate.year.value).toBe("2023");
    });

    it("sorts by title", () => {
      const result = sortWorks(mockWorks, "title");
      expect(result[0].title).toBe("First");
      expect(result[2].title).toBe("Third");
    });

    it("does not mutate original array", () => {
      const original = [...mockWorks];
      sortWorks(mockWorks, "date-asc");
      expect(mockWorks).toEqual(original);
    });
  });

  describe("enrichWorks", () => {
    const mockWorks = [
      { title: "Article", type: "journal-article", publicationDate: { year: { value: "2023" } } },
      { title: "Paper", type: "conference-paper", publicationDate: { year: { value: "2022" } } },
      { title: "Book", type: "book", publicationDate: { year: { value: "2021" } } }
    ];

    it("applies filters without sorting when no filters provided", async () => {
      const result = await enrichWorks(mockWorks, {});
      expect(result).toHaveLength(3);
    });

    it("applies work type filter", async () => {
      const result = await enrichWorks(mockWorks, {
        workType: ["journal-article"]
      });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("journal-article");
    });

    it("applies limit", async () => {
      const result = await enrichWorks(mockWorks, {
        limit: 2
      });
      expect(result).toHaveLength(2);
    });

    it("applies sorting with sort by date-desc", async () => {
      const result = await enrichWorks(mockWorks, {
        sortBy: "date-desc"
      });
      expect(result[0].publicationDate.year.value).toBe("2023");
    });

    it("combines filter, sort, and limit", async () => {
      const result = await enrichWorks(mockWorks, {
        workType: ["journal-article", "conference-paper"],
        sortBy: "date-desc",
        limit: 1
      });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Article");
    });
  });
});
