import { renderStyles } from "../utils/render-utils.js";

const MAX_COMPONENTS_PER_ROW = 6;

export function renderLayoutRow(block, renderNestedBlock) {
  if (typeof renderNestedBlock !== "function") {
    throw new Error("layout-row renderer requires a nested block renderer function");
  }

  const rows = normalizeRows(block.data || {});
  if (rows.length === 0) {
    return "";
  }
  const classes = ["layout-row", "block-layout-row", renderStyles(block)].filter(Boolean).join(" ");

  const rowsHtml = rows
    .map((row, rowIndex) => renderRow(row, rowIndex, renderNestedBlock))
    .join("");

  return `
    <section class="${classes}" data-rows="${rows.length}">
      ${rowsHtml}
    </section>
  `;
}

function renderRow(row, rowIndex, renderNestedBlock) {
  const components = Array.isArray(row.components) ? row.components : [];
  if (components.length === 0) {
    return "";
  }
  if (components.length > MAX_COMPONENTS_PER_ROW) {
    throw new Error(`layout-row supports at most ${MAX_COMPONENTS_PER_ROW} components per row`);
  }

  const widths = resolveColumnWidths(row.widths, components.length);
  const cellsHtml = components
    .map((component, index) => {
      const width = widths[index];
      return `
        <div class="layout-row-item" style="flex-basis: ${width}%; max-width: ${width}%;">
          ${renderNestedBlock(component)}
        </div>
      `;
    })
    .join("");

  return `
    <div class="layout-row-line" data-row="${rowIndex + 1}" data-columns="${components.length}">
      ${cellsHtml}
    </div>
  `;
}

function normalizeRows(data) {
  if (Array.isArray(data.rows) && data.rows.length > 0) {
    return data.rows
      .filter((row) => row && typeof row === "object")
      .map((row) => ({
        components: Array.isArray(row.components) ? row.components : [],
        widths: row.widths
      }))
      .filter((row) => row.components.length > 0);
  }

  const components = Array.isArray(data.components) ? data.components : [];
  if (components.length === 0) {
    return [];
  }

  return [{ components, widths: data.widths }];
}

function resolveColumnWidths(widths, componentCount) {
  if (!Array.isArray(widths) || widths.length === 0) {
    return buildEqualWidths(componentCount);
  }

  if (widths.length !== componentCount) {
    throw new Error(
      `layout-row widths length (${widths.length}) must match components length (${componentCount})`
    );
  }

  const parsed = widths.map(parseWidthValue);
  if (parsed.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("layout-row widths must be positive numbers (or percentage strings)");
  }

  const total = parsed.reduce((sum, value) => sum + value, 0);
  return parsed.map((value) => normalizePercentage((value / total) * 100));
}

function buildEqualWidths(componentCount) {
  const equalWidth = 100 / componentCount;
  return Array.from({ length: componentCount }, () => normalizePercentage(equalWidth));
}

function parseWidthValue(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return Number.NaN;
    if (raw.endsWith("%")) {
      return Number.parseFloat(raw.slice(0, -1));
    }
    return Number.parseFloat(raw);
  }
  return Number.NaN;
}

function normalizePercentage(value) {
  return Number(value.toFixed(4));
}
