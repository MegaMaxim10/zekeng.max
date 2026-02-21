import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { resolveHref } from "../utils/url-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderLink(block) {
  const external = block.data.external === true;
  const target = external ? "_blank" : "_self";
  const href = resolveHref(block.data.url, { external, defaultHref: "{{basePath}}/" });
  const classes = ["link", "block-link", renderStyles(block)].filter(Boolean).join(" ");

  return `
    <a href="${href}"
       target="${target}"
       ${external ? 'rel="noopener noreferrer"' : ""}
       class="${classes}">
      ${renderInlineText(block.data.label, { convertLineBreaks: false, parseLinks: false })}
    </a>
  `;
}
