import { describe, it, expect } from "vitest";
import { renderTimeline } from "../../scripts/core/components/timeline.js";

describe("renderTimeline", () => {
  it("renders inline formatting in timeline text", () => {
    const html = renderTimeline({
      type: "timeline",
      data: {
        items: [
          {
            period: "[b]2026[/b]",
            title: "Seminar [u]Session[/u]",
            description: "Impact [color=#0d6adf]focus[/color]."
          }
        ]
      }
    });

    expect(html).toContain("<strong>2026</strong>");
    expect(html).toContain("<u>Session</u>");
    expect(html).toContain('style="color: #0d6adf;"');
  });
});

