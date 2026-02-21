import { describe, it, expect } from "vitest";
import { renderLinkGroups } from "../../scripts/core/components/link-groups.js";

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

  it("prefixes internal links with basePath and infers whatsapp icon", () => {
    const block = {
      type: "link-groups",
      data: {
        groups: [
          {
            title: "Actions",
            links: [
              { label: "Contact", url: "6-contact/contact.html", external: false },
              { label: "WhatsApp", url: "https://wa.me/237600000000", external: true }
            ]
          }
        ]
      }
    };

    const html = renderLinkGroups(block);
    expect(html).toContain('href="{{basePath}}/6-contact/contact.html"');
    expect(html).toContain("WhatsApp");
    expect(html).toContain("wa.me");
  });

  it("does not re-prefix links already resolved with basePath token", () => {
    const block = {
      type: "link-groups",
      data: {
        groups: [
          {
            title: "Actions",
            links: [
              { label: "Contact", url: "{{basePath}}/6-contact/contact.html", external: false }
            ]
          }
        ]
      }
    };

    const html = renderLinkGroups(block);
    expect(html).toContain('href="{{basePath}}/6-contact/contact.html"');
    expect(html).not.toContain('{{basePath}}/{{basePath}}/');
  });
});

