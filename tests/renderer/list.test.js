import { describe, it, expect } from "vitest";
import { renderList } from "../../scripts/core/components/list.js";

describe("renderList", () => {
  it("renders unordered list by default", () => {
    const html = renderList({
      type: "list",
      data: {
        items: ["A", "B"]
      }
    });

    expect(html).toContain("<ul");
    expect(html).toContain("<li>A</li>");
  });

  it("renders ordered list when ordered is true", () => {
    const html = renderList({
      type: "list",
      data: {
        ordered: true,
        items: ["[b]First[/b]", "[u]Second[/u]"]
      }
    });

    expect(html).toContain("<ol");
    expect(html).toContain("<strong>First</strong>");
    expect(html).toContain("<u>Second</u>");
  });
});
