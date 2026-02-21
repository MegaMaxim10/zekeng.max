import { renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderList(block) {
  const data = block.data || {};
  const classes = ["block-list", renderStyles(block)].filter(Boolean).join(" ");
  const tag = data.ordered ? "ol" : "ul";
  const items = (data.items || []).map((item) => `<li>${renderInlineText(item)}</li>`).join("");

  return `
    <${tag} class="${classes}">
      ${items}
    </${tag}>
  `;
}
