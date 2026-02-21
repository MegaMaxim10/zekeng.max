import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderLink(block) {
  const target = block.data.external ? "_blank" : "_self";
  const href = block.data.external
    ? block.data.url
    : resolveInternalHref(block.data.url);
  const classes = ["link", "block-link", renderStyles(block)].filter(Boolean).join(" ");

  return `
    <a href="${href}"
       target="${target}"
       class="${classes}">
      ${escapeHtml(block.data.label)}
    </a>
  `;
}

function resolveInternalHref(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "{{basePath}}/";
  }

  if (value.startsWith("{{")) {
    return value;
  }

  return `{{basePath}}/${value.replace(/^\/+/, "")}`;
}
