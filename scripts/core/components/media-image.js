import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { normalizeAssetSrc } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderMediaImage(block) {
  const data = block.data || {};
  const rawSrc = String(data.src || "").trim();
  if (!rawSrc) {
    throw new Error("media-image requires data.src");
  }

  const src = normalizeAssetSrc(rawSrc);
  const alt = String(data.alt || data.caption || data.legend || "Image").trim();
  const caption = String(data.legend || data.caption || "").trim();
  const zoom = data.zoom === true;
  const width = Number.isFinite(data.width) && data.width > 0 ? Number(data.width) : null;
  const classes = ["media-image", "block-media-image", zoom ? "is-zoomable" : "", renderStyles(block)]
    .filter(Boolean)
    .join(" ");
  const style = width ? ` style="--media-image-max-width: ${width}px;"` : "";

  if (!zoom) {
    return `
      <figure class="${classes}"${style}>
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
        ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
      </figure>
    `;
  }

  const groupId = buildLightboxGroupId(block, rawSrc);
  const captionAttr = caption ? ` data-lightbox-caption="${escapeHtml(caption)}"` : "";

  return `
    <figure class="${classes}"${style}>
      <button
        type="button"
        class="media-image-trigger"
        data-lightbox-group="${groupId}"
        data-lightbox-index="0"
        data-lightbox-src="${escapeHtml(src)}"
        data-lightbox-alt="${escapeHtml(alt)}"${captionAttr}
        aria-label="Open image"
      >
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" />
      </button>
      ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
    </figure>
  `;
}

function buildLightboxGroupId(block, seed) {
  const base = String(block.id || seed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `media-image-${base || "item"}`;
}
