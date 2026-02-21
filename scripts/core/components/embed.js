import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { normalizeAssetSrc, resolveHref } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

const SUPPORTED_KINDS = new Set(["iframe", "video"]);

export function renderEmbed(block) {
  const data = block.data || {};
  const rawSrc = String(data.src || "").trim();
  if (!rawSrc) {
    throw new Error("embed requires data.src");
  }

  const kind = normalizeKind(data.kind, rawSrc);
  const src = kind === "video"
    ? normalizeAssetSrc(rawSrc)
    : resolveHref(rawSrc, { external: true, defaultHref: "#" });
  const title = String(data.title || "Embedded content").trim();
  const caption = String(data.caption || "").trim();
  const classes = ["embed-block", "block-embed", `kind-${kind}`, renderStyles(block)]
    .filter(Boolean)
    .join(" ");
  const ratio = normalizeRatio(data.ratio);
  const style = ratio ? ` style="--embed-ratio: ${ratio};"` : "";

  const mediaHtml = kind === "video"
    ? `<video controls preload="metadata" src="${escapeHtml(src)}"></video>`
    : `<iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

  return `
    <figure class="${classes}"${style}>
      <div class="embed-frame">
        ${mediaHtml}
      </div>
      ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
    </figure>
  `;
}

function normalizeKind(kind, src) {
  const value = String(kind || "").trim().toLowerCase();
  if (SUPPORTED_KINDS.has(value)) {
    return value;
  }
  return /\.(mp4|webm|ogg)$/i.test(String(src || "")) ? "video" : "iframe";
}

function normalizeRatio(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "16 / 9";
  }

  if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(text)) {
    return text.replace(/\s+/g, " ");
  }

  return "16 / 9";
}
