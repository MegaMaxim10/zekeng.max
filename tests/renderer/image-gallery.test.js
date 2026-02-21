import { describe, it, expect } from "vitest";
import { renderImageGallery } from "../../scripts/core/components/image-gallery.js";

describe("renderImageGallery", () => {
  it("renders gallery items with lightbox attributes", () => {
    const html = renderImageGallery({
      type: "image-gallery",
      id: "seminar-gallery",
      data: {
        layout: "masonry",
        images: [
          { src: "src/assets/images/activities/cric-itasd-seminar-17022026-samuel-fosso-wamba/1.jpg", caption: "A" },
          { src: "src/assets/images/activities/cric-itasd-seminar-17022026-samuel-fosso-wamba/2.jpg", caption: "B" }
        ]
      }
    });

    expect(html).toContain("layout-masonry");
    expect(html).toContain("data-lightbox-group");
    expect(html).toContain("data-lightbox-index=\"1\"");
  });
});

