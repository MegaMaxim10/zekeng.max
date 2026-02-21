import { describe, it, expect } from "vitest";
import { renderMediaImage } from "../../scripts/core/components/media-image.js";

describe("renderMediaImage", () => {
  it("renders image with legend and zoom trigger", () => {
    const html = renderMediaImage({
      type: "media-image",
      id: "seminar-shot",
      data: {
        src: "src/assets/images/activities/cric-itasd-seminar-17022026-samuel-fosso-wamba/1.jpg",
        alt: "Seminar photo",
        legend: "Session opening",
        zoom: true
      }
    });

    expect(html).toContain("block-media-image");
    expect(html).toContain("data-lightbox-group");
    expect(html).toContain("Session opening");
  });
});

