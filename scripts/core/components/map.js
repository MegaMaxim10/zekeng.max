import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderMap(block) {
  const data = block.data || {};
  const classes = ["map-block", "block-map", renderStyles(block)].filter(Boolean).join(" ");
  const title = data.title || "Location map";
  const height = Number.isFinite(data.height) ? Math.max(220, data.height) : 360;
  const linkHtml = data.linkUrl
    ? `<a class="map-open-link" href="${escapeHtml(data.linkUrl)}" target="_blank" rel="noopener noreferrer">Open map</a>`
    : "";
  const coordinates = hasCoordinates(data)
    ? `<p class="map-coordinates">Coordinates: ${escapeHtml(`${data.latitude}, ${data.longitude}`)}</p>`
    : "";

  return `
    <section class="${classes}" aria-label="${escapeHtml(title)}">
      <iframe
        class="map-frame"
        src="${escapeHtml(data.embedUrl)}"
        title="${escapeHtml(title)}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        style="height: ${height}px;"
      ></iframe>
      <div class="map-meta">
        ${data.address ? `<p class="map-address">${escapeHtml(data.address)}</p>` : ""}
        ${coordinates}
        ${linkHtml}
      </div>
    </section>
  `;
}

function hasCoordinates(data) {
  return typeof data.latitude === "number" && typeof data.longitude === "number";
}
