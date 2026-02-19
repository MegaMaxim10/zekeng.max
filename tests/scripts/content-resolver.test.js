import { describe, it, expect } from "vitest";
import { resolveContentConfigReferences } from "../../scripts/content-resolver.js";

const config = {
  site: {
    title: "Demo",
    contact: {
      role: "Senior Lecturer/Researcher",
      institution: "University of Dschang",
      department: "Department of Mathematics and Computer Science, Faculty of Science",
      postalAddress: "P.O Box 67, Dschang",
      office: "Door 237B, Campus C",
      coordinates: { latitude: 5.438799, longitude: 10.071175 },
      phones: ["+237674965370", "+237697329108"],
      emails: {
        institutional: "ndadji.maxime@univ-dschang.org",
        personal: ["a@x.com"],
        professional: []
      },
      socials: [{ key: "github", label: "GitHub", url: "https://github.com/example" }]
    }
  }
};

describe("content resolver", () => {
  it("resolves cfg and hook tokens", () => {
    const input = {
      text: "{{cfg:site.contact.role}} at {{cfg:site.contact.institution}}",
      map: {
        latitude: "{{cfg:site.contact.coordinates.latitude}}",
        link: "{{hook:contact.osmLinkUrl}}"
      },
      phoneLabel: "{{hook:contact.phoneDisplay(0)}}",
      phoneUrl: "{{hook:contact.phoneTelUrl(0)}}",
      mailto: "{{hook:contact.emailMailto(institutional)}}",
      social: "{{hook:contact.socialUrl(github)}}"
    };

    const resolved = resolveContentConfigReferences(input, config);
    expect(resolved.text).toContain("Senior Lecturer/Researcher");
    expect(resolved.map.latitude).toBe(5.438799);
    expect(String(resolved.map.link)).toContain("openstreetmap.org");
    expect(resolved.phoneUrl).toBe("tel:+237674965370");
    expect(resolved.mailto).toBe("mailto:ndadji.maxime@univ-dschang.org");
    expect(resolved.social).toBe("https://github.com/example");
  });
});
