import { escapeHtml } from "./render-utils.js";
import { isExternalUrl, resolveHref } from "./url-utils.js";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const TAG_NAME_PATTERN = /(b|i|u|mark|code|s)/i;
const COLOR_TOKEN_PATTERN = /\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi;
const FONT_TOKEN_PATTERN = /\[font=([^\]]+)\]([\s\S]*?)\[\/font\]/gi;
const SIZE_TOKEN_PATTERN = /\[size=([^\]]+)\]([\s\S]*?)\[\/size\]/gi;
const SIMPLE_TOKEN_PATTERN = /\[(b|i|u|mark|code|s)\]([\s\S]*?)\[\/\1\]/gi;
const MARKDOWN_STRONG_PATTERN = /\*\*([^*][\s\S]*?)\*\*/g;
const MARKDOWN_EM_PATTERN = /\*([^*\n][\s\S]*?)\*/g;
const MARKDOWN_UNDERLINE_PATTERN = /__([^_][\s\S]*?)__/g;
const MARKDOWN_STRIKE_PATTERN = /~~([^~][\s\S]*?)~~/g;
const MARKDOWN_CODE_PATTERN = /`([^`\n][\s\S]*?)`/g;
const FONT_STACKS = {
  sans: "var(--font-sans)",
  serif: '"Merriweather", Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  heading: "var(--font-heading)"
};
const SEMANTIC_TAG_MAP = {
  b: "strong",
  i: "em",
  u: "u",
  mark: "mark",
  code: "code",
  s: "s"
};

export function renderInlineText(text, options = {}) {
  const value = String(text ?? "");
  const linkClass = String(options.linkClass || "").trim();
  const convertLineBreaks = options.convertLineBreaks !== false;
  const parseLinks = options.parseLinks !== false;
  if (!parseLinks) {
    return renderTextSegment(value, { convertLineBreaks });
  }
  let html = "";
  let lastIndex = 0;

  for (const match of value.matchAll(LINK_PATTERN)) {
    const index = Number(match.index || 0);
    html += renderTextSegment(value.slice(lastIndex, index), { convertLineBreaks });

    const label = match[1];
    const href = resolveHref(match[2], { defaultHref: "#" });
    const external = isExternalUrl(href);
    const targetAttrs = external ? ` target="_blank" rel="noopener noreferrer"` : "";
    const classAttr = linkClass ? ` class="${escapeHtml(linkClass)}"` : "";
    html += `<a href="${escapeHtml(href)}"${classAttr}${targetAttrs}>${renderTextSegment(label, { convertLineBreaks: false })}</a>`;

    lastIndex = index + match[0].length;
  }

  html += renderTextSegment(value.slice(lastIndex), { convertLineBreaks });
  return html;
}

function renderTextSegment(segment, options = {}) {
  const convertLineBreaks = options.convertLineBreaks !== false;
  let html = applyInlineFormatting(String(segment || ""));
  if (convertLineBreaks) {
    html = html.replace(/\n/g, "<br />");
  }
  return html;
}

function applyInlineFormatting(text) {
  let html = escapeHtml(String(text || ""));

  html = applyRecursiveReplacement(html, COLOR_TOKEN_PATTERN, (_, color, content) => {
    const safeColor = normalizeColor(color);
    if (!safeColor) return content;
    return `<span style="color: ${escapeHtml(safeColor)};">${content}</span>`;
  });

  html = applyRecursiveReplacement(html, FONT_TOKEN_PATTERN, (_, font, content) => {
    const safeFont = normalizeFont(font);
    if (!safeFont) return content;
    return `<span style="font-family: ${escapeHtml(safeFont)};">${content}</span>`;
  });

  html = applyRecursiveReplacement(html, SIZE_TOKEN_PATTERN, (_, size, content) => {
    const safeSize = normalizeFontSize(size);
    if (!safeSize) return content;
    return `<span style="font-size: ${escapeHtml(safeSize)};">${content}</span>`;
  });

  html = applyRecursiveReplacement(html, SIMPLE_TOKEN_PATTERN, (_, tag, content) => {
    if (!TAG_NAME_PATTERN.test(tag)) return content;
    const normalized = String(tag || "").toLowerCase();
    const semanticTag = SEMANTIC_TAG_MAP[normalized] || normalized;
    return `<${semanticTag}>${content}</${semanticTag}>`;
  });

  html = html
    .replace(MARKDOWN_CODE_PATTERN, "<code>$1</code>")
    .replace(MARKDOWN_STRONG_PATTERN, "<strong>$1</strong>")
    .replace(MARKDOWN_UNDERLINE_PATTERN, "<u>$1</u>")
    .replace(MARKDOWN_STRIKE_PATTERN, "<s>$1</s>")
    .replace(MARKDOWN_EM_PATTERN, "<em>$1</em>");

  return html;
}

function applyRecursiveReplacement(input, pattern, replace) {
  let output = String(input || "");
  let previous = "";
  while (output !== previous) {
    previous = output;
    output = output.replace(pattern, replace);
  }
  return output;
}

function normalizeColor(value) {
  const color = String(value || "").trim().toLowerCase();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
    return color;
  }
  if (/^(rgb|rgba|hsl|hsla)\(\s*[-+0-9.%\s,]+\)$/.test(color)) {
    return color;
  }
  if (/^[a-z]{3,20}$/.test(color)) {
    return color;
  }
  return "";
}

function normalizeFont(value) {
  const key = String(value || "").trim().toLowerCase();
  return FONT_STACKS[key] || "";
}

function normalizeFontSize(value) {
  const size = String(value || "").trim().toLowerCase();
  if (/^\d+(\.\d+)?(px|rem|em|%)$/.test(size)) {
    return size;
  }
  return "";
}
