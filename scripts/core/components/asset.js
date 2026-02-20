import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderAsset(block) {
  const classes = ["asset", `asset-${block.data.kind}`, "block-asset", renderStyles(block)].filter(Boolean).join(" ");
  return `
    <div class="${classes}">
      <a href="{{basePath}}/${block.data.src}" target="_blank">
        ${escapeHtml(block.data.label || "Download")}
      </a>
    </div>
  `;
}
