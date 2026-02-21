import { describe, it, expect } from "vitest";
import { renderLink } from "../../scripts/core/components/link.js";

describe("renderLink", () => {
  it("prefixes internal relative links with basePath", () => {
    const block = {
      type: "link",
      data: {
        label: "Contact",
        url: "6-contact/contact.html",
        external: false
      }
    };

    const html = renderLink(block);
    expect(html).toContain('href="{{basePath}}/6-contact/contact.html"');
  });

  it("does not re-prefix links already resolved with basePath token", () => {
    const block = {
      type: "link",
      data: {
        label: "Contact",
        url: "{{basePath}}/6-contact/contact.html",
        external: false
      }
    };

    const html = renderLink(block);
    expect(html).toContain('href="{{basePath}}/6-contact/contact.html"');
    expect(html).not.toContain("{{basePath}}/{{basePath}}/");
  });

  it("renders inline formatting in link label", () => {
    const block = {
      type: "link",
      data: {
        label: "[b]Contact[/b] page",
        url: "6-contact/contact.html",
        external: false
      }
    };

    const html = renderLink(block);
    expect(html).toContain("<strong>Contact</strong>");
  });
});
