import { describe, it, expect } from "vitest";
import { renderOrcid } from "../../src/js/components/orcid.js";

describe("renderOrcid", () => {
  it("renders a basic orcid block with no data", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["works"]
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("orcid-profile");
    expect(html).toContain("0000-0002-0417-5591");
  });

  it("renders orcid block with cached works data", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["works"],
        cachedData: {
          sections: {
            works: [
              {
                title: "Test Publication",
                type: "journal-article",
                publicationDate: { year: { value: "2023" } },
                journalTitle: "Test Journal",
                externalIds: {
                  externalIdentifier: [
                    {
                      externalIdentifierType: "DOI",
                      externalIdentifierId: { value: "10.1234/test" }
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("Publications");
    expect(html).toContain("Test Publication");
    expect(html).toContain("Journal Article");
    expect(html).toContain("2023");
    expect(html).toContain("DOI");
  });

  it("renders orcid block with cached education data", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["education"],
        cachedData: {
          sections: {
            education: [
              {
                institution: "Test University",
                degree: "Ph.D.",
                field: "Computer Science",
                startDate: { year: { value: "2015" } },
                endDate: { year: { value: "2020" } }
              }
            ]
          }
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("Education");
    expect(html).toContain("Test University");
    expect(html).toContain("Ph.D.");
    expect(html).toContain("Computer Science");
  });

  it("renders orcid block with cached employment data", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["employment"],
        cachedData: {
          sections: {
            employment: [
              {
                organization: "Test Corp",
                position: "Senior Researcher",
                department: "R&D",
                startDate: { year: { value: "2020" } },
                endDate: null
              }
            ]
          }
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("Employment");
    expect(html).toContain("Test Corp");
    expect(html).toContain("Senior Researcher");
  });

  it("renders empty state for missing sections", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["works"],
        cachedData: {
          sections: {
            works: []
          }
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("No publications available");
  });

  it("renders multiple sections", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        sections: ["works", "education"],
        cachedData: {
          sections: {
            works: [
              {
                title: "Paper",
                type: "journal-article",
                publicationDate: { year: { value: "2023" } }
              }
            ],
            education: [
              {
                institution: "University",
                degree: "PhD",
                startDate: { year: { value: "2020" } },
                endDate: { year: { value: "2023" } }
              }
            ]
          }
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("Publications");
    expect(html).toContain("Education");
    expect(html).toContain("Paper");
    expect(html).toContain("University");
  });

  it("handles blocks with custom styles", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591"
      },
      style: ["custom-class"]
    };

    const html = renderOrcid(block);
    expect(html).toContain("custom-class");
  });

  it("renders ORCID profile link", () => {
    const block = {
      type: "orcid",
      data: {
        orcidId: "0000-0002-0417-5591",
        displayOptions: { showTitle: true },
        cachedData: {
          sections: {}
        }
      }
    };

    const html = renderOrcid(block);
    expect(html).toContain("https://orcid.org/0000-0002-0417-5591");
    expect(html).toContain("ORCID Profile");
  });
});
