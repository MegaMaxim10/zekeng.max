import { describe, it, expect } from "vitest";
import { buildSiteGraph } from "../../scripts/builders/site-graph.js";
import { generateRelatedPages } from "../../scripts/builders/navigation.js";
import { pages } from "../fixtures/site.nested.js";

describe("related pages", () => {
  const graph = buildSiteGraph(pages);

  it("lists all descendant pages", () => {
    const research = pages.find(p => p.dir === "content/research");
    research.json.meta = { genRelatedPages: true };

    const html = generateRelatedPages(research, graph);
    expect(html).toContain("Projects");
    expect(html).toContain("Papers");
  });

  it("returns empty when disabled", () => {
    const teaching = pages.find(p => p.dir === "content/teaching");
    teaching.json.meta = { genRelatedPages: false };

    expect(generateRelatedPages(teaching, graph)).toBe("");
  });
});


