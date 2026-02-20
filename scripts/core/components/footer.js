import { escapeHtml } from "../utils/render-utils.js";

export function renderFooter(footer) {
  return `
    <section class="page-footer">
      ${footer.notes ? `<p>${escapeHtml(footer.notes)}</p>` : ""}
    </section>
  `;
}