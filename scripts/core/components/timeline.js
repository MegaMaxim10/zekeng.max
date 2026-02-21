import { renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderTimeline(block) {
  const classes = ["timeline", "block-timeline", renderStyles(block)].filter(Boolean).join(" ");
  const items = block.data.items.map(item => `
    <div class="timeline-item">
      <div class="timeline-period">${renderInlineText(item.period, { convertLineBreaks: false })}</div>
      <div class="timeline-content">
        <strong>${renderInlineText(item.title, { convertLineBreaks: false })}</strong>
        ${item.description ? `<p>${renderInlineText(item.description)}</p>` : ""}
      </div>
    </div>
  `).join("");

  return `
    <section class="${classes}">
      ${items}
    </section>
  `;
}
