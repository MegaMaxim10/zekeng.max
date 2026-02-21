import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { normalizeAssetSrc } from "../utils/url-utils.js";

const SUPPORTED_SHAPES = new Set(["square", "rounded", "circle", "octagon", "hexagon", "diamond"]);
const SUPPORTED_EFFECTS = new Set([
  "none",
  "slide-ltr",
  "slide-rtl",
  "slide-ttb",
  "slide-btt",
  "fade-in",
  "blink"
]);

export function renderFeatureImage(block) {
  const data = block.data || {};
  const rawSrc = String(data.src || "").trim();
  if (!rawSrc) {
    throw new Error("feature-image requires data.src");
  }

  const src = normalizeAssetSrc(rawSrc);
  const alt = escapeHtml(data.alt || "Feature image");
  const shape = normalizeShape(data.shape);
  const effect = normalizeEffect(data.loadEffect);
  const classes = [
    "feature-image",
    "block-feature-image",
    `shape-${shape}`,
    `effect-${effect}`,
    data.shadow ? "has-shadow" : "",
    data.zoom ? "is-zoomable" : "",
    renderStyles(block)
  ]
    .filter(Boolean)
    .join(" ");

  const sizeStyle = Number.isFinite(data.size) && data.size > 0
    ? ` style="--feature-image-size: ${Number(data.size)}px;"`
    : "";

  if (!data.zoom) {
    return `
      <figure class="${classes}"${sizeStyle}>
        <div class="feature-image-frame">
          <img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" />
        </div>
      </figure>
    `;
  }

  const zoomId = buildZoomId(block, rawSrc);
  return `
    <figure class="${classes}"${sizeStyle}>
      <input id="${zoomId}" class="feature-image-zoom-toggle" type="checkbox" />
      <label class="feature-image-frame" for="${zoomId}" role="button" aria-label="Open enlarged image">
        <img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" />
      </label>
      <label class="feature-image-zoom-overlay" for="${zoomId}" aria-label="Close enlarged image">
        <img class="feature-image-zoom-image" src="${escapeHtml(src)}" alt="${alt}" loading="lazy" decoding="async" />
      </label>
    </figure>
  `;
}

function normalizeShape(value) {
  const key = String(value || "").trim().toLowerCase();
  if (SUPPORTED_SHAPES.has(key)) {
    return key;
  }
  return "square";
}

function normalizeEffect(value) {
  const key = String(value || "").trim().toLowerCase();
  if (SUPPORTED_EFFECTS.has(key)) {
    return key;
  }
  return "none";
}

function buildZoomId(block, src) {
  const base = String(block.id || src)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `feature-image-zoom-${base || "item"}`;
}
