import { renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderHeading(block) {
  const level = block.data.level;
  const classes = ["block-heading", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <h${level} class="${classes}">
      ${renderInlineText(block.data.text, { convertLineBreaks: false })}
    </h${level}>
  `;
}
