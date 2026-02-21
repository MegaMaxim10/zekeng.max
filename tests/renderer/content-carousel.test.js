import { describe, it, expect } from "vitest";
import { renderContentCarousel } from "../../scripts/core/components/content-carousel.js";

describe("renderContentCarousel", () => {
  it("renders fixed-size content carousel with controls and view more link", () => {
    const html = renderContentCarousel({
      type: "content-carousel",
      data: {
        source: "tests/fixtures/content/collection",
        includeRootFiles: false,
        publishedOnly: true,
        defaultSort: "date-desc",
        limit: 10,
        viewMoreUrl: "1-news/news.html",
        viewMoreLabel: "View all news"
      }
    });

    expect(html).toContain("data-content-carousel");
    expect(html).toContain("data-carousel-track");
    expect(html).toContain("data-carousel-prev");
    expect(html).toContain("data-carousel-next");
    expect(html).toContain("View all news");
    expect(html).toContain("Item A");
    expect(html).not.toContain("Item B");
  });
});

