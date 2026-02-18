import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderList(block) {
  const classes = ["block-list", renderStyles(block)].filter(Boolean).join(" ");
  const items = block.data.items
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <ul class="${classes}">
      ${items}
    </ul>
  `;
}
