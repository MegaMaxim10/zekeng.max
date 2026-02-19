/**
 * Static Site Generator - Build Orchestration
 *
 * Responsibilities:
 * - clean output directory
 * - load content pages
 * - build site graph
 * - generate HTML pages
 * - copy static assets
 * - minify final output
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
const FRAMEWORK_CONFIG_PATH = "framework.config.json";
const DEFAULT_TEMPLATE_PATH = "src/templates/page.html";
const BASE_PATH = process.env.BASE_PATH || "";
const SITE_TITLE = siteData?.title || "My Static Site";

const DEFAULT_FRAMEWORK_CONFIG = {
  templates: {
    default: DEFAULT_TEMPLATE_PATH,
    entries: {
      default: DEFAULT_TEMPLATE_PATH
    }
  },
  styles: {
    defaultProfile: "default",
    profiles: {
      default: [
        "assets/css/main.css",
        "assets/css/components.css"
      ]
    }
  },
  scripts: {
    default: ["assets/js/custom/global.js"]
  },
  seo: {
    siteUrl: "",
    defaultLocale: "en_US",
    defaultType: "website",
    defaultRobots: "index,follow",
    defaultImage: "",
    twitterHandle: "",
    organizationName: "",
    sameAs: []
  }
};

function readFrameworkConfig() {
  if (!fs.existsSync(FRAMEWORK_CONFIG_PATH)) {
    return DEFAULT_FRAMEWORK_CONFIG;
  }

  const userConfig = JSON.parse(fs.readFileSync(FRAMEWORK_CONFIG_PATH, "utf-8"));
  return {
    ...DEFAULT_FRAMEWORK_CONFIG,
    ...userConfig,
    templates: {
      ...DEFAULT_FRAMEWORK_CONFIG.templates,
      ...(userConfig.templates || {}),
      entries: {
        ...DEFAULT_FRAMEWORK_CONFIG.templates.entries,
        ...(userConfig.templates?.entries || {})
      }
    },
    styles: {
      ...DEFAULT_FRAMEWORK_CONFIG.styles,
      ...(userConfig.styles || {}),
      profiles: {
        ...DEFAULT_FRAMEWORK_CONFIG.styles.profiles,
        ...(userConfig.styles?.profiles || {})
      }
    },
    scripts: {
      ...DEFAULT_FRAMEWORK_CONFIG.scripts,
      ...(userConfig.scripts || {})
    },
    seo: {
      ...DEFAULT_FRAMEWORK_CONFIG.seo,
      ...(userConfig.seo || {})
    }
  };
}

const frameworkConfig = readFrameworkConfig();
const templateCache = new Map();

if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
console.log("Output directory cleaned");

function applyTemplate(template, variables) {
  return template.replaceAll(/{{(\w+)}}/g, (_, key) => variables[key] ?? "");
}

function loadTemplate(templatePath) {
  if (!templateCache.has(templatePath)) {
    templateCache.set(templatePath, fs.readFileSync(templatePath, "utf-8"));
  }
  return templateCache.get(templatePath);
}

function resolveTemplatePath(templateName) {
  const entries = frameworkConfig.templates?.entries || {};
  if (templateName && entries[templateName]) {
    return entries[templateName];
  }

  const defaultTemplateRef = frameworkConfig.templates?.default || DEFAULT_TEMPLATE_PATH;
  if (entries[defaultTemplateRef]) {
    return entries[defaultTemplateRef];
  }
  return defaultTemplateRef;
}

function normalizeAssetHref(assetPath) {
  if (!assetPath) return null;
  const normalized = String(assetPath).trim().replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    throw new Error(`Invalid asset path "${assetPath}"`);
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${BASE_PATH}${normalized}`;
  }

  return `${BASE_PATH}/${normalized}`;
}

function unique(items) {
  return [...new Set(items)];
}

function resolvePageAssets(pageJson) {
  const presentation = pageJson.presentation || {};
  const stylesConfig = frameworkConfig.styles || {};
  const profiles = stylesConfig.profiles || {};
  const defaultProfile = stylesConfig.defaultProfile || "default";
  const selectedProfile = presentation.styleProfile || defaultProfile;
  const profileAssets = profiles[selectedProfile] || profiles[defaultProfile] || [];

  const stylesheetHrefs = unique([
    ...profileAssets,
    ...(presentation.extraStyles || [])
  ]).map(normalizeAssetHref);

  const scriptHrefs = unique([
    ...(frameworkConfig.scripts?.default || []),
    ...(presentation.extraScripts || [])
  ]).map(normalizeAssetHref);

  return {
    stylesheetHrefs,
    scriptHrefs,
    bodyClass: presentation.bodyClass || "",
    template: presentation.template || null
  };
}

function renderStylesheetTags(hrefs) {
  return hrefs
    .map((href) => `  <link rel="stylesheet" href="${href}" />`)
    .join("\n");
}

function renderScriptTags(hrefs) {
  return hrefs
    .map((href) => `<script type="text/javascript" src="${href}"></script>`)
    .join("\n");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function stripTags(value) {
  return String(value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function trimDescription(value, maxLength = 160) {
  const text = stripTags(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function normalizePagePath(pagePath) {
  const normalized = `/${String(pagePath).replace(/\\/g, "/").replace(/^\/+/, "")}`;
  return normalized;
}

function toAbsoluteUrl(href, siteUrl) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  if (!siteUrl) return href;
  const base = siteUrl.replace(/\/+$/, "");
  const pathPart = href.startsWith("/") ? href : `/${href}`;
  return `${base}${pathPart}`;
}

function resolveSeo(page, outPathRelative) {
  const seoConfig = frameworkConfig.seo || {};
  const meta = page.json.meta || {};
  const social = meta.social || {};

  const pagePath = normalizePagePath(outPathRelative);
  const siteUrl = String(seoConfig.siteUrl || "").trim();
  const canonicalRaw = meta.canonical || pagePath;
  const canonicalUrl = toAbsoluteUrl(canonicalRaw, siteUrl);

  const title = page.json.meta?.title || page.json.header?.title || SITE_TITLE;
  const description = trimDescription(
    meta.description || page.json.header?.lead || siteData?.description || ""
  );
  const image = toAbsoluteUrl(
    social.image || meta.image || seoConfig.defaultImage || "",
    siteUrl
  );
  const type = social.type || seoConfig.defaultType || "website";
  const robots = meta.robots || seoConfig.defaultRobots || "index,follow";
  const keywords = Array.isArray(meta.tags) && meta.tags.length > 0
    ? meta.tags.join(", ")
    : Array.isArray(siteData?.keywords)
      ? siteData.keywords.join(", ")
      : "";
  const locale = seoConfig.defaultLocale || "en_US";
  const author = siteData?.author || "";
  const twitterHandle = seoConfig.twitterHandle || "";
  const twitterCard = social.card || (image ? "summary_large_image" : "summary");
  const publishedTime = meta.publishedTime || "";
  const modifiedTime = meta.modifiedTime || "";
  const sameAs = Array.isArray(seoConfig.sameAs) ? seoConfig.sameAs.filter(Boolean) : [];
  const orgName = seoConfig.organizationName || siteData?.author || "";

  const tags = [];
  if (description) tags.push(`<meta name="description" content="${escapeHtml(description)}" />`);
  if (keywords) tags.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  if (author) tags.push(`<meta name="author" content="${escapeHtml(author)}" />`);
  if (robots) tags.push(`<meta name="robots" content="${escapeHtml(robots)}" />`);
  if (canonicalUrl) tags.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);

  tags.push(`<meta property="og:title" content="${escapeHtml(social.title || title)}" />`);
  if (description) tags.push(`<meta property="og:description" content="${escapeHtml(social.description || description)}" />`);
  tags.push(`<meta property="og:type" content="${escapeHtml(type)}" />`);
  if (canonicalUrl) tags.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
  tags.push(`<meta property="og:site_name" content="${escapeHtml(SITE_TITLE)}" />`);
  tags.push(`<meta property="og:locale" content="${escapeHtml(locale)}" />`);
  if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
  if (publishedTime) tags.push(`<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`);
  if (modifiedTime) tags.push(`<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />`);

  tags.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(social.title || title)}" />`);
  if (description) tags.push(`<meta name="twitter:description" content="${escapeHtml(social.description || description)}" />`);
  if (image) tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  if (twitterHandle) tags.push(`<meta name="twitter:site" content="${escapeHtml(twitterHandle)}" />`);

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: meta.language || "en",
    name: title,
    description,
    url: canonicalUrl || pagePath
  };
  if (modifiedTime) {
    webPageLd.dateModified = modifiedTime;
  }

  const graph = [webPageLd];
  if (orgName) {
    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: orgName
    };
    if (sameAs.length > 0) {
      orgLd.sameAs = sameAs;
    }
    graph.push(orgLd);
  }

  const ldJson = JSON.stringify(
    graph.length === 1 ? graph[0] : { "@context": "https://schema.org", "@graph": graph }
  ).replaceAll("</script>", "<\\/script>");
  tags.push(`<script type="application/ld+json">${ldJson}</script>`);

  return {
    language: meta.language || "en",
    headMeta: tags.join("\n")
  };
}

function loadAllPages() {
  const files = globSync(`${CONTENT_DIR}/**/*.json`);
  return files.map((file) => ({
    file,
    json: JSON.parse(fs.readFileSync(file, "utf-8")),
    dir: path.dirname(file),
    name: path.basename(file)
  }));
}

const pages = loadAllPages();
console.log(`Loaded ${pages.length} content pages`);

const siteGraph = buildSiteGraph(pages, CONTENT_DIR);
const navigationHtml = generateNavigation(siteGraph, BASE_PATH);
const lastModified = new Date().toISOString().split("T")[0];

for (const page of pages) {
  await preprocessPage(page);

  const renderedContent = renderPage(page.json);
  const contentHtml = applyTemplate(renderedContent, { basePath: BASE_PATH });

  const pageAssets = resolvePageAssets(page.json);
  const outPathRelative = outputPathFor(page, CONTENT_DIR);
  const seo = resolveSeo(page, outPathRelative);
  const templatePath = resolveTemplatePath(pageAssets.template);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  const template = loadTemplate(templatePath);

  const finalHtml = applyTemplate(template, {
    basePath: BASE_PATH,
    title: page.json.meta?.title || page.json.header?.title || SITE_TITLE,
    siteTitle: SITE_TITLE,
    navigation: navigationHtml,
    breadcrumb: generateBreadcrumb(page, siteGraph, BASE_PATH),
    content: contentHtml,
    relatedPages: generateRelatedPages(page, siteGraph, BASE_PATH),
    year: new Date().getFullYear(),
    lastModified,
    stylesheets: renderStylesheetTags(pageAssets.stylesheetHrefs),
    scripts: renderScriptTags(pageAssets.scriptHrefs),
    bodyClass: pageAssets.bodyClass,
    language: seo.language,
    headMeta: seo.headMeta
  });

  const outPath = path.join(OUTPUT_DIR, outPathRelative);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, finalHtml);
  console.log(`Generated ${outPath}`);
}

console.log("Copying static assets...");
copyDir(ASSETS_DIR, path.join(OUTPUT_DIR, "assets"));
copyDir(CSS_DIR, path.join(OUTPUT_DIR, "assets/css"));
copyDir(CUSTOM_JS_DIR, path.join(OUTPUT_DIR, "assets/js/custom"));
console.log("Static assets copied");

console.log("Minifying output...");
await minifyDirectory(OUTPUT_DIR);
console.log("Minification complete");

console.log("\nStatic site generation complete.");
