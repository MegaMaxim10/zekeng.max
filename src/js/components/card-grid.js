import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderCardGrid(block) {
  const classes = ["card-grid", "block-card-grid", renderStyles(block)].filter(Boolean).join(" ");
  const cards = block.data.cards.map(card => `
    <div class="card">
      ${card.image ? `<img src="{{basePath}}/${card.image}" alt="">` : ""}
      <h3>${escapeHtml(card.title)}</h3>
      ${card.description ? `<p>${escapeHtml(card.description)}</p>` : ""}
      ${card.link ? `<a href="{{basePath}}/${card.link}">Learn more</a>` : ""}
    </div>
  `).join("");

  return `
    <section class="${classes}">
      ${cards}
    </section>
  `;
}
