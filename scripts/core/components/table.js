import { renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderTable(block) {
  const data = block.data || {};
  const rows = Array.isArray(data.rows) ? data.rows : [];
  if (rows.length === 0) {
    throw new Error("table requires at least one row");
  }

  const headers = Array.isArray(data.headers) ? data.headers : [];
  const caption = String(data.caption || "").trim();
  const classes = ["table-block", "block-table", data.compact ? "is-compact" : "", renderStyles(block)]
    .filter(Boolean)
    .join(" ");

  const headerHtml = headers.length > 0
    ? `
      <thead>
        <tr>
          ${headers.map((header) => `<th scope="col">${renderInlineText(String(header || ""))}</th>`).join("")}
        </tr>
      </thead>
    `
    : "";

  const bodyHtml = rows
    .map((row) => {
      const cells = Array.isArray(row) ? row : [row];
      return `<tr>${cells.map((cell) => `<td>${renderInlineText(String(cell ?? ""))}</td>`).join("")}</tr>`;
    })
    .join("");

  return `
    <figure class="${classes}">
      ${caption ? `<figcaption>${renderInlineText(caption, { convertLineBreaks: false, parseLinks: false })}</figcaption>` : ""}
      <div class="table-wrap">
        <table>
          ${headerHtml}
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    </figure>
  `;
}
