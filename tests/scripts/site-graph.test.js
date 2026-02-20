import { describe, it, expect } from "vitest";
import { buildSiteGraph, outputPathFor } from "../../scripts/builders/site-graph.js";
import { pages } from "../fixtures/site.nested.js";

describe("site graph", () => {
  const graph = buildSiteGraph(pages);

  it("groups pages by directory", () => {
    expect(Object.keys(graph.byDir)).toContain("content/research");
  });

  it("selects a main page per directory", () => {
    expect(graph.byDir["content/research"].main.name).toBe("index.json");
  });

  it("maps root page to index.html", () => {
    const root = pages.find(p => p.dir === "content");
    expect(outputPathFor(root)).toBe("index.html");
  });

  it("keeps non-main pages names", () => {
    const papers = pages.find(p => p.name === "papers.json");
    expect(outputPathFor(papers)).toBeOneOf(["research/papers.html", String.raw`research\papers.html`]);
  });
});


