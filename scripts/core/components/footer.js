import { renderInlineText } from "../utils/inline-text.js";

export function renderFooter(footer) {
  return `
    <section class="page-footer">
      ${footer.notes ? `<p>${renderInlineText(footer.notes)}</p>` : ""}
    </section>
  `;
}
