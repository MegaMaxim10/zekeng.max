import { escapeHtml } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderHeader(header) {
  return `
    <section class="page-header">
      <h1>${renderInlineText(header.title, { convertLineBreaks: false })}</h1>
      ${header.subtitle ? `<h2>${renderInlineText(header.subtitle, { convertLineBreaks: false })}</h2>` : ""}
      ${header.lead ? `<p class="lead">${renderInlineText(header.lead)}</p>` : ""}
      ${header.image ? `
        <img src="{{basePath}}/${header.image.src}"
             alt="${escapeHtml(header.image.alt || "")}" />
      ` : ""}
    </section>
  `;
}
