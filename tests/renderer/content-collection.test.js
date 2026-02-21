import { describe, it, expect } from "vitest";
import { renderContentCollection } from "../../scripts/core/components/content-collection.js";

describe("renderContentCollection", () => {
  it("renders published entries from a folder and excludes drafts", () => {
    const html = renderContentCollection({
      type: "content-collection",
      data: {
        source: "tests/fixtures/content/collection",
        includeRootFiles: false,
        publishedOnly: true,
        maxColumns: 3,
        enableSort: true,
        enableFilter: true
      }
    });

    expect(html).toContain("content-collection-grid");
    expect(html).toContain("Item A");
    expect(html).not.toContain("Item B");
    expect(html).toContain("data-collection-sort");
    expect(html).toContain("data-collection-search");
  });
});

