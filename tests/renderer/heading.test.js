import { describe, it, expect } from "vitest";
import { renderHeading } from "../../scripts/core/components/heading.js";

describe("renderHeading", () => {
  it("renders rich text formatting in heading content", () => {
    const html = renderHeading({
      type: "heading",
      data: {
        level: 3,
        text: "[color=#0d6adf][b]Research[/b][/color] [u]Highlights[/u]"
      }
    });

    expect(html).toContain("<h3");
    expect(html).toContain('<span style="color: #0d6adf;">');
    expect(html).toContain("<strong>Research</strong>");
    expect(html).toContain("<u>Highlights</u>");
  });
});

