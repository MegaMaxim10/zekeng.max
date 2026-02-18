/**
 * Static Site Generator – Build Orchestration
 *
 * Responsibilities:
 *  - clean output directory
 *  - load content pages
 *  - build site graph
 *  - generate HTML pages
 *  - copy static assets
 *  - minify final output
 */

import * as fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

import { renderPage, siteData } from "../src/js/renderer.js";
import { preprocessPage } from "../src/js/block-processors.js";
import { minifyDirectory } from "./minify.js";

import { buildSiteGraph, outputPathFor } from "./site-graph.js";
import {
  generateNavigation,
  generateBreadcrumb,
  generateRelatedPages
} from "./navigation.js";
import { copyDir } from "./assets.js";

const CONTENT_DIR = "content";
const OUTPUT_DIR = "public";
const ASSETS_DIR = "assets";
const CSS_DIR = "src/css";
const CUSTOM_JS_DIR = "src/js/custom";
const TEMPLATE_PATH = "src/templates/page.html";
const BASE_PATH = process.env.BASE_PATH || "";
const SITE_TITLE = siteData?.title || "My Static Site";

if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log("✔ Output directory cleaned");

const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

function applyTemplate(template, variables) {
  return template.replaceAll(/{{(\w+)}}/g, (_, key) => variables[key] ?? "");
}

function loadAllPages() {
  const files = globSync(`${CONTENT_DIR}/**/*.json`);

  return files.map(file => ({
    file,
    json: JSON.parse(fs.readFileSync(file, "utf-8")),
    dir: path.dirname(file),
    name: path.basename(file)
  }));
}

const pages = loadAllPages();
console.log(`✔ Loaded ${pages.length} content pages`);
const siteGraph = buildSiteGraph(pages, CONTENT_DIR);
const navigationHtml = generateNavigation(siteGraph, BASE_PATH);

const lastModified = new Date().toISOString().split("T")[0];

for (const page of pages) {
  // Preprocess blocks (e.g., fetch external data for async-capable blocks)
  await preprocessPage(page);

  // Render content
  const renderedContent = renderPage(page.json);

  // Apply basePath inside rendered HTML if needed
  const contentHtml = applyTemplate(renderedContent, {
    basePath: BASE_PATH
  });

  // Assemble full page
  const finalHtml = applyTemplate(template, {
    basePath: BASE_PATH,
    title:
      page.json.meta?.title ||
      page.json.header?.title ||
      SITE_TITLE,
    siteTitle: SITE_TITLE,
    navigation: navigationHtml,
    breadcrumb: generateBreadcrumb(page, siteGraph, BASE_PATH),
    content: contentHtml,
    relatedPages: generateRelatedPages(page, siteGraph, BASE_PATH),
    year: new Date().getFullYear(),
    lastModified
  });

  // Compute output path
  const outPath = path.join(
    OUTPUT_DIR,
    outputPathFor(page, CONTENT_DIR)
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, finalHtml);

  console.log(`✔ Generated ${outPath}`);
}

console.log("✔ Copying static assets…");

copyDir(ASSETS_DIR, path.join(OUTPUT_DIR, "assets"));
copyDir(CSS_DIR, path.join(OUTPUT_DIR, "assets/css"));
copyDir(CUSTOM_JS_DIR, path.join(OUTPUT_DIR, "assets/js/custom"));

console.log("✔ Static assets copied");

console.log("✔ Minifying output…");
await minifyDirectory(OUTPUT_DIR);
console.log("✔ Minification complete");


console.log("\nStatic site generation complete.");
