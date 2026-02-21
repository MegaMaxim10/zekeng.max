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
    expect(html).toContain('data-rows="1"');
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

  it("renders multiple rows when data.rows is provided", () => {
    const page = {
      meta: { id: "layout-row-rows", title: "Layout Row Rows", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            rows: [
              {
                widths: [2, 1],
                components: [
                  { type: "paragraph", data: { text: "Row 1A" } },
                  { type: "paragraph", data: { text: "Row 1B" } }
                ]
              },
              {
                components: [
                  { type: "paragraph", data: { text: "Row 2" } }
                ]
              }
            ]
          }
        }
      ]
    };

    const html = renderPage(page);
    expect(html).toContain('data-rows="2"');
    expect(html).toContain('data-row="1"');
    expect(html).toContain('data-row="2"');
    expect(html).toContain("Row 1A");
    expect(html).toContain("Row 2");
  });

  it("supports nested layout rows", () => {
    const page = {
      meta: { id: "layout-row-nested", title: "Layout Row Nested", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            components: [
              { type: "paragraph", data: { text: "Top Left" } },
              {
                type: "layout-row",
                data: {
                  rows: [
                    {
                      components: [
                        { type: "paragraph", data: { text: "Nested Item" } }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    };

    const html = renderPage(page);
    expect(html).toContain("Top Left");
    expect(html).toContain("Nested Item");
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

  it("rejects row widths when count does not match components", () => {
    const page = {
      meta: { id: "layout-row-bad-widths", title: "Layout Row Bad Widths", language: "en" },
      body: [
        {
          type: "layout-row",
          data: {
            rows: [
              {
                widths: [1, 1, 1],
                components: [
                  { type: "paragraph", data: { text: "A" } },
                  { type: "paragraph", data: { text: "B" } }
                ]
              }
            ]
          }
        }
      ]
    };

    expect(() => renderPage(page)).toThrow("must match components length");
  });
});
