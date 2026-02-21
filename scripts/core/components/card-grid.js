import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";
import { resolveHref } from "../utils/url-utils.js";

export function renderCardGrid(block) {
  const classes = ["card-grid", "block-card-grid", renderStyles(block)].filter(Boolean).join(" ");
  const cards = block.data.cards.map(card => `
    <div class="card">
      ${card.image ? `<img src="{{basePath}}/${card.image}" alt="">` : ""}
      <h3>${renderInlineText(card.title, { convertLineBreaks: false })}</h3>
      ${card.description ? `<p>${renderInlineText(card.description)}</p>` : ""}
      ${card.link ? `<a href="${escapeHtml(resolveHref(card.link, { defaultHref: "#" }))}">${renderInlineText(card.linkLabel || "Learn more", { convertLineBreaks: false, parseLinks: false })}</a>` : ""}
    </div>
  `).join("");

  return `
    <section class="${classes}">
      ${cards}
    </section>
  `;
}
