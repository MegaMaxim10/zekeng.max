import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderTimeline(block) {
  const classes = ["timeline", "block-timeline", renderStyles(block)].filter(Boolean).join(" ");
  const items = block.data.items.map(item => `
    <div class="timeline-item">
      <div class="timeline-period">${escapeHtml(item.period)}</div>
      <div class="timeline-content">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>
    </div>
  `).join("");

  return `
    <section class="${classes}">
      ${items}
    </section>
  `;
}
