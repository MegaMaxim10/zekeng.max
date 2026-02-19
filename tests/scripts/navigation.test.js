import { describe, it, expect } from "vitest";
import { buildSiteGraph } from "../../scripts/site-graph.js";
import { generateNavigation } from "../../scripts/navigation.js";
import { pages } from "../fixtures/site.nested.js";

describe("navigation generation", () => {
  const graph = buildSiteGraph(pages);
  const html = generateNavigation(graph);

  it("contains Home link", () => {
    expect(html).toContain("Home");
    expect(html).toContain("/index.html");
  });

  it("contains top-level sections", () => {
    expect(html).toContain("Research");
    expect(html).toContain("Teaching");
  });

  it("does not mark items without children as submenu items", () => {
    expect(html).toContain('<li class="menu-item"><a class="menu-link" href="/teaching/index.html">Teaching</a></li>');
  });

  it("generates submenu when allowed", () => {
    expect(html).toContain("Projects");
  });
});
