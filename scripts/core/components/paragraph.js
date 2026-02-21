import { renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderParagraph(block) {
  const classes = ["block-paragraph", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <p class="${classes}">
      ${renderInlineText(block.data.text)}
    </p>
  `;
}
