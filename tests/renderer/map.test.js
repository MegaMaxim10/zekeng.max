import { describe, it, expect } from "vitest";
import { renderMap } from "../../scripts/core/components/map.js";

describe("renderMap", () => {
  it("renders provider-derived map urls from coordinates", () => {
    const block = {
      type: "map",
      data: {
        title: "Office location map",
        provider: "openstreetmap",
        address: "Faculty of Science, Campus C",
        latitude: 5.438799,
        longitude: 10.071175
      }
    };

    const html = renderMap(block);
    expect(html).toContain("iframe");
    expect(html).toContain("Office location map");
    expect(html).toContain("Coordinates: 5.438799, 10.071175");
    expect(html).toContain("openstreetmap.org/export/embed.html");
    expect(html).toContain("openstreetmap.org/?mlat=5.438799&amp;mlon=10.071175");
  });
});

