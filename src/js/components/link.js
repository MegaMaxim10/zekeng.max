import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderLink(block) {
  const target = block.data.external ? "_blank" : "_self";
  const href = block.data.external ? block.data.url : `{{basePath}}/${block.data.url}`;
  const classes = ["link", "block-link", renderStyles(block)].filter(Boolean).join(" ");

  return `
    <a href="${href}"
       target="${target}"
       class="${classes}">
      ${escapeHtml(block.data.label)}
    </a>
  `;
}
