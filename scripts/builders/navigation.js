import path from "node:path";
import { urlFor } from "./site-graph.js";

function compareAlphabetically(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function normalizeDir(dir) {
  return String(dir || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

export function generateNavigation(siteGraph, basePath = "") {
  const byDir = siteGraph.byDir || {};
  const contentDir = normalizeDir(siteGraph.contentDir);
  const root = byDir[contentDir]?.main;
  if (!root) return "";

  let html = `<ul class="menu menu-root">`;
  html += `<li class="menu-item"><a class="menu-link" href="${urlFor(root, siteGraph, basePath)}">Home</a></li>`;

  Object.keys(byDir)
    .filter(dir => dir !== contentDir && path.posix.dirname(normalizeDir(dir)) === contentDir)
    .sort(compareAlphabetically)
    .forEach(dir => {
      const main = byDir[dir].main;
      const title = main.json.meta?.title || main.json.header?.title;
      const subMenusAllowed = (
        main.json.meta?.genSubMenus === undefined ||
        main.json.meta?.genSubMenus === true
      );
      const children = subMenusAllowed
        ? Object.keys(byDir)
          .filter(d => path.posix.dirname(normalizeDir(d)) === normalizeDir(dir))
          .sort(compareAlphabetically)
        : [];
      const hasSubmenu = children.length > 0;

      html += `<li class="menu-item${hasSubmenu ? " has-submenu" : ""}">`;
      html += `<a class="menu-link" href="${urlFor(main, siteGraph, basePath)}">${title}</a>`;

      if (hasSubmenu) {
        html += `<ul class="submenu">`;
        children.forEach(cd => {
          const childMain = byDir[cd].main;
          const ct =
            childMain.json.meta?.title ||
            childMain.json.header?.title;

          html += `<li class="submenu-item"><a class="submenu-link" href="${urlFor(childMain, siteGraph, basePath)}">${ct}</a></li>`;
        });
        html += `</ul>`;
      }

      html += `</li>`;
    });

  html += `</ul>`;
  return html;
}

export function generateBreadcrumb(page, siteGraph, basePath = "") {
  const contentDir = normalizeDir(siteGraph.contentDir);
  const pageDir = normalizeDir(page.dir);
  const parts = pageDir
    .replace(contentDir, "")
    .split(/[\\/]/)
    .filter(Boolean);

  const crumbs = [{
    label: "Home",
    href: `${basePath}/`
  }];

  let acc = contentDir;
  
  parts.forEach(part => {
    acc = normalizeDir(path.posix.join(acc, part));
    const main = siteGraph.byDir[acc]?.main;
    if (main) {
      const title =
        main.json.meta?.title ||
        main.json.header?.title;

      crumbs.push({
        label: title,
        href: urlFor(main, siteGraph, basePath)
      });
    }
  });

  const items = crumbs
    .map((crumb, index) => {
      const isActive = index === crumbs.length - 1;
      if (isActive) {
        return `<li class="breadcrumb-item active" aria-current="page"><span>${crumb.label}</span></li>`;
      }
      return `<li class="breadcrumb-item"><a class="breadcrumb-link" href="${crumb.href}">${crumb.label}</a></li>`;
    })
    .join("");

  return `<nav class="breadcrumb-nav" aria-label="Breadcrumb"><ol class="breadcrumb-list">${items}</ol></nav>`;
}

export function generateRelatedPages(page, siteGraph, basePath = "") {
  if (page.json.meta?.genRelatedPages !== true) return "";

  const related = siteGraph.pages.filter(
    p => p.dir.startsWith(page.dir) && p !== page
  );

  if (!related.length) return "";

  const links = related
    .map(p => {
      const title = p.json.meta?.title || p.json.header?.title;
      return `<li class="related-pages-item"><a class="related-pages-link" href="${urlFor(p, siteGraph, basePath)}">${title}</a></li>`;
    })
    .join("");

  return `
    <section class="related-pages">
      <div class="related-pages-inner">
        <h2>Related Pages</h2>
        <ul>${links}</ul>
      </div>
    </section>
  `;
}
