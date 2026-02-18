import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderHeading(block) {
  const level = block.data.level;
  const classes = ["block-heading", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <h${level} class="${classes}">
      ${escapeHtml(block.data.text)}
    </h${level}>
  `;
}
