import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderAsset(block) {
  const classes = ["asset", `asset-${block.data.kind}`, "block-asset", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <div class="${classes}">
      <a href="{{basePath}}/${block.data.src}" target="_blank">
        ${renderInlineText(block.data.label || "Download", { convertLineBreaks: false, parseLinks: false })}
      </a>
    </div>
  `;
}
