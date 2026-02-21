import { describe, it, expect } from "vitest";
import { renderPage } from "../../scripts/core/renderer.js";

describe("layout-row", () => {
  it("renders child blocks on one row with equal widths by default", () => {
    const page = {
      meta: { id: "layout-row", title: "Layout Row", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            components: [
              { type: "paragraph", data: { text: "Column A" } },
              { type: "paragraph", data: { text: "Column B" } },
              { type: "paragraph", data: { text: "Column C" } }
            ]
          }
        }
      ]
    };

    const html = renderPage(page);
    expect(html).toContain('class="layout-row block-layout-row"');
    expect(html).toContain('data-columns="3"');
    expect(html).toContain("flex-basis: 33.3333%");
    expect(html).toContain("Column A");
    expect(html).toContain("Column B");
    expect(html).toContain("Column C");
  });

  it("normalizes custom widths to percentages", () => {
    const page = {
      meta: { id: "layout-row-custom", title: "Layout Row Custom", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            widths: [3, 1],
            components: [
              { type: "paragraph", data: { text: "Wide" } },
              { type: "paragraph", data: { text: "Narrow" } }
            ]
          }
        }
      ]
    };

    const html = renderPage(page);
    expect(html).toContain("flex-basis: 75%");
    expect(html).toContain("flex-basis: 25%");
  });

  it("rejects rows with more than six components", () => {
    const page = {
      meta: { id: "layout-row-limit", title: "Layout Row Limit", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            components: [
              { type: "paragraph", data: { text: "1" } },
              { type: "paragraph", data: { text: "2" } },
              { type: "paragraph", data: { text: "3" } },
              { type: "paragraph", data: { text: "4" } },
              { type: "paragraph", data: { text: "5" } },
              { type: "paragraph", data: { text: "6" } },
              { type: "paragraph", data: { text: "7" } }
            ]
          }
        }
      ]
    };

    expect(() => renderPage(page)).toThrow("at most 6 components");
  });
});
