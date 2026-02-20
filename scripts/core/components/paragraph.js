import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderParagraph(block) {
  const classes = ["block-paragraph", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <p class="${classes}">
      ${escapeHtml(block.data.text)}
    </p>
  `;
}
