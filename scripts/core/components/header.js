import { escapeHtml } from "../utils/render-utils.js";

export function renderHeader(header) {
  return `
    <section class="page-header">
      <h1>${escapeHtml(header.title)}</h1>
      ${header.subtitle ? `<h2>${escapeHtml(header.subtitle)}</h2>` : ""}
      ${header.lead ? `<p class="lead">${escapeHtml(header.lead)}</p>` : ""}
      ${header.image ? `
        <img src="{{basePath}}/${header.image.src}"
             alt="${escapeHtml(header.image.alt || "")}" />
      ` : ""}
    </section>
  `;
}