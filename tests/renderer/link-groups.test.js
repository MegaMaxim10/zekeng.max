import { describe, it, expect } from "vitest";
import { renderLinkGroups } from "../../src/js/components/link-groups.js";

describe("renderLinkGroups", () => {
  it("renders grouped links with icons", () => {
    const block = {
      type: "link-groups",
      data: {
        title: "Profiles",
        columns: 2,
        groups: [
          {
            title: "Social",
            links: [
              { label: "GitHub", url: "https://github.com/example", external: true, icon: "github" },
              { label: "Email", url: "mailto:test@example.com", external: true }
            ]
          }
        ]
      }
    };

    const html = renderLinkGroups(block);
    expect(html).toContain("Profiles");
    expect(html).toContain("GitHub");
    expect(html).toContain("link-groups-icon");
  });
});
