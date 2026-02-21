import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderCodeBlock(block) {
  const data = block.data || {};
  const code = String(data.code || "");
  const language = String(data.language || "text").trim().toLowerCase();
  const caption = String(data.caption || "").trim();
  const lineNumbers = data.lineNumbers === true;
  const classes = ["code-block", "block-code-block", renderStyles(block)].filter(Boolean).join(" ");
  const codeClass = language ? `language-${escapeHtml(language)}` : "";
  const codeHtml = lineNumbers ? renderCodeWithLineNumbers(code) : escapeHtml(code);

  return `
    <figure class="${classes}">
      ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
      <pre class="code-block-pre${lineNumbers ? " has-line-numbers" : ""}"><code class="${codeClass}">${codeHtml}</code></pre>
    </figure>
  `;
}

function renderCodeWithLineNumbers(code) {
  const lines = String(code || "").replace(/\r\n/g, "\n").split("\n");
  return lines
    .map((line, index) => `<span class="code-block-line" data-line="${index + 1}">${escapeHtml(line || " ")}</span>`)
    .join("\n");
}
