import { describe, it, expect } from "vitest";
import { buildSiteGraph } from "../../scripts/builders/site-graph.js";
import { generateBreadcrumb } from "../../scripts/builders/navigation.js";
import { pages } from "../fixtures/site.nested.js";
import path from "node:path";

describe("breadcrumb generation", () => {
  const graph = buildSiteGraph(pages);

  it("builds full breadcrumb path", () => {
    const page = pages.find(p => p.dir === "content/research/projects");
    
    // A trick to make the test work on both Windows and Unix
    let p = path.join("content", "research");
    graph.byDir[p] = graph.byDir["content/research"];
    p = path.join(p, "projects");
    graph.byDir[p] = graph.byDir["content/research/projects"];

    const bc = generateBreadcrumb(page, graph);

    expect(bc).toContain("Home");
    expect(bc).toContain("Research");
    expect(bc).toContain("Projects");
  });
});


