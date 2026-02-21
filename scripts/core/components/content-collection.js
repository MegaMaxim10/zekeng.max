import * as fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { normalizeAssetSrc } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";
import { resolveOutputBasename } from "../../shared/page-output.js";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});

const DEFAULT_SORT = "date-desc";
const DEFAULT_EXCERPT_LENGTH = 180;

export function renderContentCollection(block) {
  const data = block.data || {};
  const maxColumns = clampInteger(data.maxColumns, 3, 2, 4);
  const defaultSort = normalizeSortKey(data.defaultSort || DEFAULT_SORT);
  const enableSort = data.enableSort === true;
  const enableFilter = data.enableFilter === true;
  const emptyMessage = String(data.emptyMessage || "No published content yet.").trim();
  const visibleEntries = collectContentEntries({
    source: data.source,
    includeRootFiles: data.includeRootFiles === true,
    publishedOnly: data.publishedOnly !== false,
    exclude: Array.isArray(data.exclude) ? data.exclude : [],
    excerptLength: clampInteger(data.excerptLength, DEFAULT_EXCERPT_LENGTH, 80, 420),
    defaultSort,
    limit: Number.isInteger(data.limit) && data.limit > 0 ? data.limit : null
  });
  const allTags = [...new Set(visibleEntries.flatMap((entry) => entry.tags))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const classes = ["content-collection", "block-content-collection", renderStyles(block)]
    .filter(Boolean)
    .join(" ");

  const controls = (enableSort || enableFilter)
    ? renderCollectionControls({
      enableSort,
      enableFilter,
      defaultSort,
      tags: allTags
    })
    : "";

  const cards = visibleEntries
    .map((entry) => renderCollectionCard(entry))
    .join("");

  const body = visibleEntries.length > 0
    ? `<div class="content-collection-grid" data-collection-grid>${cards}</div>`
    : `<p class="content-collection-empty">${escapeHtml(emptyMessage)}</p>`;

  return `
    <section
      class="${classes}"
      style="--content-collection-columns: ${maxColumns};"
      data-content-collection
      data-default-sort="${escapeHtml(defaultSort)}"
    >
      ${data.title ? `<h2 class="content-collection-title">${renderInlineText(data.title, { convertLineBreaks: false })}</h2>` : ""}
      ${data.intro ? `<p class="content-collection-intro">${renderInlineText(data.intro)}</p>` : ""}
      ${controls}
      ${body}
    </section>
  `;
}

export function collectContentEntries(options = {}) {
  const source = String(options.source || "").trim();
  if (!source) {
    throw new Error("content source is required");
  }

  const sourceRoot = resolveSourceRoot(source);
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`content source not found: ${sourceRoot}`);
  }

  const includeRootFiles = options.includeRootFiles === true;
  const publishedOnly = options.publishedOnly !== false;
  const excerptLength = clampInteger(options.excerptLength, DEFAULT_EXCERPT_LENGTH, 80, 420);
  const defaultSort = normalizeSortKey(options.defaultSort || DEFAULT_SORT);
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : null;
  const exclude = new Set((options.exclude || []).map((item) => normalizeRelativePath(item)));
  const files = globSync("**/*.json", { cwd: sourceRoot, nodir: true })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .filter((relativePath) => {
      const normalized = normalizeRelativePath(relativePath);
      if (!includeRootFiles && !normalized.includes("/")) {
        return false;
      }
      if (exclude.has(normalized) || exclude.has(path.posix.basename(normalized))) {
        return false;
      }
      return true;
    });

  const entries = files
    .map((relativePath) =>
      toCollectionEntry(path.join(sourceRoot, relativePath), relativePath, {
        excerptLength,
        publishedOnly
      })
    )
    .filter(Boolean);
  const sortedEntries = sortEntries(entries, defaultSort);
  return limit ? sortedEntries.slice(0, limit) : sortedEntries;
}

function toCollectionEntry(filePath, relativePath, options) {
  const payload = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const meta = payload.meta || {};
  const status = resolvePublishStatus(meta);
  if (options.publishedOnly && status !== "published") {
    return null;
  }

  const title = String(meta.title || payload.header?.title || path.basename(relativePath, ".json")).trim();
  const excerpt = buildExcerpt(payload, options.excerptLength);
  const dateInfo = resolveDateInfo(meta);
  const image = resolvePreviewImage(payload);
  const tags = normalizeTags(meta.tags);
  const href = resolveContentHref(filePath, payload);

  return {
    title,
    excerpt,
    image,
    href,
    tags,
    dateIso: dateInfo.iso,
    dateLabel: dateInfo.label,
    dateOrder: dateInfo.order
  };
}

function renderCollectionCard(entry) {
  const normalizedTags = entry.tags.map((tag) => tag.toLowerCase());
  const searchBlob = [entry.title, entry.excerpt, entry.tags.join(" ")].join(" ").toLowerCase();
  const tagsHtml = entry.tags.length > 0
    ? `<ul class="content-collection-tags">${entry.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
    : "";

  return `
    <article
      class="content-collection-card"
      data-collection-item
      data-title="${escapeHtml(entry.title.toLowerCase())}"
      data-excerpt="${escapeHtml(entry.excerpt.toLowerCase())}"
      data-search="${escapeHtml(searchBlob)}"
      data-tags="${escapeHtml(normalizedTags.join("|"))}"
      data-date-order="${entry.dateOrder}"
    >
      <a class="content-collection-card-link" href="${escapeHtml(entry.href)}">
        ${entry.image ? `
          <div class="content-collection-card-media">
            <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" loading="lazy" decoding="async" />
          </div>
        ` : ""}
        <div class="content-collection-card-body">
          ${entry.dateLabel ? `<time class="content-collection-date" datetime="${escapeHtml(entry.dateIso)}">${escapeHtml(entry.dateLabel)}</time>` : ""}
          <h3 class="content-collection-card-title">${renderInlineText(entry.title, { convertLineBreaks: false, parseLinks: false })}</h3>
          ${entry.excerpt ? `<p class="content-collection-card-excerpt">${renderInlineText(entry.excerpt, { parseLinks: false })}</p>` : ""}
          ${tagsHtml}
        </div>
      </a>
    </article>
  `;
}

function renderCollectionControls({ enableSort, enableFilter, defaultSort, tags }) {
  const sortControl = enableSort
    ? `
      <label class="content-collection-control">
        <span>Sort</span>
        <select data-collection-sort>
          ${renderSortOption("date-desc", "Newest first", defaultSort)}
          ${renderSortOption("date-asc", "Oldest first", defaultSort)}
          ${renderSortOption("title-asc", "Title A-Z", defaultSort)}
          ${renderSortOption("title-desc", "Title Z-A", defaultSort)}
        </select>
      </label>
    `
    : "";

  const filterControl = enableFilter
    ? `
      <label class="content-collection-control content-collection-search">
        <span>Search</span>
        <input type="search" placeholder="Search titles and summaries..." data-collection-search />
      </label>
    `
    : "";

  const tagControl = enableFilter && tags.length > 0
    ? `
      <details class="content-collection-tags-dropdown">
        <summary><span>Tags</span><span class="content-collection-tags-count">${tags.length}</span></summary>
        <fieldset class="content-collection-tags-filter" data-collection-tags>
          <legend class="sr-only">Tags</legend>
          ${tags.map((tag) => `
            <label class="content-collection-tag-option">
              <input type="checkbox" value="${escapeHtml(tag.toLowerCase())}" />
              <span>${escapeHtml(tag)}</span>
            </label>
          `).join("")}
        </fieldset>
      </details>
    `
    : "";

  return `
    <div class="content-collection-controls" data-collection-controls>
      ${sortControl}
      ${filterControl}
      ${tagControl}
    </div>
  `;
}

function renderSortOption(value, label, selectedValue) {
  const selected = value === selectedValue ? ' selected="selected"' : "";
  return `<option value="${value}"${selected}>${label}</option>`;
}

function resolveSourceRoot(source) {
  const normalized = String(source).trim().replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    throw new Error(`Invalid content-collection source "${source}"`);
  }
  if (fs.existsSync(normalized)) {
    return normalized;
  }
  if (normalized.startsWith("src/content/")) {
    return normalized;
  }
  if (normalized.startsWith("content/")) {
    return `src/${normalized}`;
  }
  if (normalized.startsWith("src/")) {
    return normalized;
  }
  return `src/content/${normalized}`;
}

function resolvePublishStatus(meta) {
  if (typeof meta?.published === "boolean") {
    return meta.published ? "published" : "draft";
  }

  const status = String(meta?.status || "").trim().toLowerCase();
  if (status === "published" || status === "draft") {
    return status;
  }

  const visibility = String(meta?.visibility || "").trim().toLowerCase();
  return visibility === "private" ? "draft" : "published";
}

function resolveDateInfo(meta) {
  const raw = String(meta?.publishedTime || meta?.lastUpdated || meta?.modifiedTime || "").trim();
  if (!raw) {
    return { iso: "", label: "", order: 0 };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const asDate = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(asDate.getTime())) {
      return { iso: "", label: "", order: 0 };
    }
    return {
      iso: raw,
      label: DATE_FORMATTER.format(asDate),
      order: asDate.getTime()
    };
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { iso: "", label: "", order: 0 };
  }

  return {
    iso: parsed.toISOString(),
    label: DATE_FORMATTER.format(parsed),
    order: parsed.getTime()
  };
}

function resolvePreviewImage(pageJson) {
  const metaImage = pageJson?.meta?.image;
  if (metaImage) {
    return normalizeAssetSrc(metaImage);
  }

  const headerImage = pageJson?.header?.image?.src;
  if (headerImage) {
    return normalizeAssetSrc(headerImage);
  }

  for (const block of pageJson?.body || []) {
    if ((block?.type === "feature-image" || block?.type === "profile-image" || block?.type === "media-image")
      && block?.data?.src) {
      return normalizeAssetSrc(block.data.src);
    }

    if (block?.type === "image-gallery") {
      const firstImage = Array.isArray(block?.data?.images) ? block.data.images[0] : null;
      if (firstImage?.src) {
        return normalizeAssetSrc(firstImage.src);
      }
    }
  }

  return "";
}

function buildExcerpt(pageJson, maxLength) {
  const pieces = [
    pageJson?.meta?.description,
    pageJson?.header?.lead,
    firstParagraphText(pageJson?.body || []),
    firstListItemText(pageJson?.body || [])
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (pieces.length === 0) return "";
  return truncateText(stripInlineMarkdown(pieces[0]), maxLength);
}

function firstParagraphText(body) {
  const paragraph = body.find((block) => block?.type === "paragraph" && block?.data?.text);
  return paragraph?.data?.text || "";
}

function firstListItemText(body) {
  const listBlock = body.find((block) => block?.type === "list" && Array.isArray(block?.data?.items));
  return listBlock?.data?.items?.[0] || "";
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean);
}

function normalizeRelativePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function resolveContentHref(filePath, pageJson) {
  const normalized = String(filePath || "").replace(/\\/g, "/");
  const marker = "/src/content/";
  const markerIndex = normalized.toLowerCase().lastIndexOf(marker);
  const relativeJsonPath = markerIndex >= 0
    ? normalized.slice(markerIndex + marker.length)
    : normalized.replace(/^src\/content\//i, "");
  const relativeDir = path.posix.dirname(relativeJsonPath);
  const basename = resolveOutputBasename({
    name: path.posix.basename(relativeJsonPath),
    json: pageJson
  });
  const htmlPath = relativeDir === "."
    ? `${basename}.html`
    : `${relativeDir}/${basename}.html`;
  return `{{basePath}}/${htmlPath}`;
}

function sortEntries(entries, sortKey) {
  const cloned = [...entries];
  switch (sortKey) {
    case "date-asc":
      return cloned.sort((a, b) => a.dateOrder - b.dateOrder || a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
    case "title-asc":
      return cloned.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true }));
    case "title-desc":
      return cloned.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base", numeric: true }));
    case "date-desc":
    default:
      return cloned.sort((a, b) => b.dateOrder - a.dateOrder || a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  }
}

function normalizeSortKey(value) {
  const key = String(value || "").trim().toLowerCase();
  if (["date-desc", "date-asc", "title-asc", "title-desc"].includes(key)) {
    return key;
  }
  return DEFAULT_SORT;
}

function truncateText(text, maxLength) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function stripInlineMarkdown(text) {
  return String(text || "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function clampInteger(value, fallback, min, max) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(Number(value))));
}
