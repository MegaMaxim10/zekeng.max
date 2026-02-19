import { describe, it, expect } from "vitest";
import { renderMap } from "../../src/js/components/map.js";

describe("renderMap", () => {
  it("renders an embeddable map with metadata", () => {
    const block = {
      type: "map",
      data: {
        title: "Office location map",
        embedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=10%2C5%2C11%2C6",
        linkUrl: "https://www.openstreetmap.org/?mlat=5.438799&mlon=10.071175",
        address: "Faculty of Science, Campus C",
        latitude: 5.438799,
        longitude: 10.071175
      }
    };

    const html = renderMap(block);
    expect(html).toContain("iframe");
    expect(html).toContain("Office location map");
    expect(html).toContain("Coordinates: 5.438799, 10.071175");
  });
});
