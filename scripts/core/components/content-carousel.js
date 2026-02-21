import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { resolveHref } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";
import { collectContentEntries } from "./content-collection.js";

const DEFAULT_LIMIT = 6;

export function renderContentCarousel(block) {
  const data = block.data || {};
  const limit = Number.isInteger(data.limit) && data.limit > 0
    ? data.limit
    : DEFAULT_LIMIT;
  const entries = collectContentEntries({
    source: data.source,
    includeRootFiles: data.includeRootFiles === true,
    publishedOnly: data.publishedOnly !== false,
    exclude: Array.isArray(data.exclude) ? data.exclude : [],
    excerptLength: Number.isInteger(data.excerptLength) ? data.excerptLength : 150,
    defaultSort: data.defaultSort || "date-desc",
    limit
  });

  const classes = ["content-carousel", "block-content-carousel", renderStyles(block)]
    .filter(Boolean)
    .join(" ");
  const emptyMessage = String(data.emptyMessage || "No published content yet.").trim();
  const cardMinWidth = Number.isFinite(data.cardMinWidth) && data.cardMinWidth > 200
    ? Math.min(420, Math.round(Number(data.cardMinWidth)))
    : 300;

  const controls = `
    <div class="content-carousel-controls">
      <div class="content-carousel-nav">
        <button type="button" class="content-carousel-btn is-prev" data-carousel-prev aria-label="Previous items">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 5.3a1 1 0 0 1 0 1.4L10.41 11l4.3 4.3a1 1 0 0 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z"/></svg>
        </button>
        <button type="button" class="content-carousel-btn is-next" data-carousel-next aria-label="Next items">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.29 18.7a1 1 0 0 1 0-1.41L13.58 13l-4.3-4.29a1 1 0 1 1 1.42-1.42l5 5a1 1 0 0 1 0 1.42l-5 5a1 1 0 0 1-1.41 0z"/></svg>
        </button>
      </div>
      ${data.viewMoreUrl ? `<a class="content-carousel-view-more" href="${escapeHtml(resolveHref(data.viewMoreUrl, { defaultHref: "#" }))}">${renderInlineText(data.viewMoreLabel || "View more", { convertLineBreaks: false, parseLinks: false })}</a>` : ""}
    </div>
  `;

  const body = entries.length > 0
    ? `
      ${controls}
      <div class="content-carousel-track" data-carousel-track style="--content-carousel-card-width: ${cardMinWidth}px;">
        ${entries.map((entry) => renderCarouselCard(entry)).join("")}
      </div>
    `
    : `<p class="content-carousel-empty">${escapeHtml(emptyMessage)}</p>`;

  return `
    <section class="${classes}" data-content-carousel>
      ${data.title ? `<h2 class="content-carousel-title">${renderInlineText(data.title, { convertLineBreaks: false })}</h2>` : ""}
      ${data.intro ? `<p class="content-carousel-intro">${renderInlineText(data.intro)}</p>` : ""}
      ${body}
    </section>
  `;
}

function renderCarouselCard(entry) {
  const tagsHtml = entry.tags.length > 0
    ? `<ul class="content-carousel-tags">${entry.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
    : "";

  return `
    <article class="content-carousel-card">
      <a class="content-carousel-card-link" href="${escapeHtml(entry.href)}">
        ${entry.image ? `
          <div class="content-carousel-card-media">
            <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title)}" loading="lazy" decoding="async" />
          </div>
        ` : ""}
        <div class="content-carousel-card-body">
          ${entry.dateLabel ? `<time class="content-carousel-date" datetime="${escapeHtml(entry.dateIso)}">${escapeHtml(entry.dateLabel)}</time>` : ""}
          <h3 class="content-carousel-card-title">${renderInlineText(entry.title, { convertLineBreaks: false, parseLinks: false })}</h3>
          ${entry.excerpt ? `<p class="content-carousel-card-excerpt">${renderInlineText(entry.excerpt, { parseLinks: false })}</p>` : ""}
          ${tagsHtml}
        </div>
      </a>
    </article>
  `;
}

