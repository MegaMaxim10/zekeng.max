import path from "node:path";

function normalizeDir(dir) {
  return String(dir || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

export function buildSiteGraph(pages, contentDir = "content") {
  const normalizedContentDir = normalizeDir(contentDir);
  const byDir = {};

  pages.forEach(p => {
    p.dir = normalizeDir(p.dir);
    if (!byDir[p.dir]) byDir[p.dir] = [];
    byDir[p.dir].push(p);
  });

  Object.keys(byDir).forEach(dir => {
    byDir[dir].sort((a, b) => a.name.localeCompare(b.name));
    byDir[dir].main = byDir[dir][0];
  });

  return {
    contentDir: normalizedContentDir,
    pages,
    byDir
  };
}

export function outputPathFor(page, contentDir = "content") {
  const relDir = normalizeDir(page.dir)
    .replace(normalizeDir(contentDir), "")
    .replace(/^[/\\]/, "");

  if (!relDir) {
    return "index.html";
  }

  return path.join(
    relDir,
    page.name.replace(".json", ".html")
  );
}

export function urlFor(page, siteGraph, basePath = "") {
  const out = outputPathFor(page, siteGraph.contentDir)
    .replaceAll("\\", "/");

  return `${basePath}/${out}`.replaceAll(/\/+/g, "/");
}
