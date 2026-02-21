import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { normalizeAssetSrc } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

const SUPPORTED_LAYOUTS = new Set(["masonry", "photo", "justified", "moodboard", "photomontage"]);

export function renderImageGallery(block) {
  const data = block.data || {};
  const images = Array.isArray(data.images) ? data.images : [];
  if (images.length === 0) {
    throw new Error("image-gallery requires at least one image");
  }

  const layout = normalizeLayout(data.layout);
  const zoom = data.zoom !== false;
  const carousel = data.carousel !== false;
  const gap = Number.isFinite(data.gap) && data.gap > 0 ? Number(data.gap) : null;
  const groupId = buildGalleryGroupId(block, images[0]?.src || "gallery");

  const classes = [
    "image-gallery",
    "block-image-gallery",
    `layout-${layout}`,
    zoom ? "is-zoomable" : "",
    carousel ? "has-carousel" : "",
    renderStyles(block)
  ]
    .filter(Boolean)
    .join(" ");
  const style = gap ? ` style="--image-gallery-gap: ${gap}px;"` : "";

  const itemsHtml = images
    .map((image, index) => renderGalleryItem(image, index, { zoom, groupId }))
    .join("");

  return `
    <section class="${classes}"${style}>
      ${data.title ? `<h3 class="image-gallery-title">${renderInlineText(data.title, { convertLineBreaks: false })}</h3>` : ""}
      <div class="image-gallery-grid">
        ${itemsHtml}
      </div>
    </section>
  `;
}

function renderGalleryItem(image, index, options) {
  const src = normalizeAssetSrc(image?.src || "");
  if (!src) {
    throw new Error(`image-gallery item ${index + 1} is missing src`);
  }

  const alt = String(image?.alt || image?.caption || `Gallery image ${index + 1}`).trim();
  const caption = String(image?.caption || "").trim();
  const captionAttr = caption ? ` data-lightbox-caption="${escapeHtml(caption)}"` : "";
  const imageHtml = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />`;

  if (!options.zoom) {
    return `
      <figure class="image-gallery-item">
        ${imageHtml}
        ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
      </figure>
    `;
  }

  return `
    <figure class="image-gallery-item">
      <button
        type="button"
        class="image-gallery-trigger"
        data-lightbox-group="${options.groupId}"
        data-lightbox-index="${index}"
        data-lightbox-src="${escapeHtml(src)}"
        data-lightbox-alt="${escapeHtml(alt)}"${captionAttr}
        aria-label="Open image ${index + 1}"
      >
        ${imageHtml}
      </button>
      ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
    </figure>
  `;
}

function normalizeLayout(value) {
  const key = String(value || "").trim().toLowerCase();
  if (SUPPORTED_LAYOUTS.has(key)) {
    return key;
  }
  return "photo";
}

function buildGalleryGroupId(block, seed) {
  const base = String(block.id || seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `image-gallery-${base || "items"}`;
}
