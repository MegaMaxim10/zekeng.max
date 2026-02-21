import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderMap(block) {
  const data = block.data || {};
  const classes = ["map-block", "block-map", renderStyles(block)].filter(Boolean).join(" ");
  const title = data.title || "Location map";
  const height = Number.isFinite(data.height) ? Math.max(220, data.height) : 360;
  const provider = normalizeProvider(data.provider);
  const mapUrls = resolveMapUrls(data, provider);

  const linkHtml = mapUrls.linkUrl
    ? `<a class="map-open-link" href="${escapeHtml(mapUrls.linkUrl)}" target="_blank" rel="noopener noreferrer">${renderInlineText("Open map", { convertLineBreaks: false })}</a>`
    : "";
  const coordinates = hasCoordinates(data)
    ? `<p class="map-coordinates">Coordinates: ${escapeHtml(`${data.latitude}, ${data.longitude}`)}</p>`
    : "";
  const frameHtml = mapUrls.embedUrl
    ? `
      <iframe
        class="map-frame"
        src="${escapeHtml(mapUrls.embedUrl)}"
        title="${escapeHtml(title)}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        style="height: ${height}px;"
      ></iframe>
    `
    : "";

  return `
    <section class="${classes}" aria-label="${escapeHtml(title)}">
      ${frameHtml}
      <div class="map-meta">
        ${data.address ? `<p class="map-address">${renderInlineText(data.address)}</p>` : ""}
        ${coordinates}
        ${linkHtml}
      </div>
    </section>
  `;
}

function hasCoordinates(data) {
  return typeof data.latitude === "number" && typeof data.longitude === "number";
}

function normalizeProvider(provider) {
  return String(provider || "openstreetmap").trim().toLowerCase();
}

function resolveMapUrls(data, provider) {
  const manualEmbedUrl = normalizeOptionalUrl(data.embedUrl);
  const manualLinkUrl = normalizeOptionalUrl(data.linkUrl);
  if (!hasCoordinates(data)) {
    return { embedUrl: manualEmbedUrl, linkUrl: manualLinkUrl };
  }

  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  const derived = buildProviderUrls(provider, latitude, longitude);
  return {
    embedUrl: manualEmbedUrl || derived.embedUrl,
    linkUrl: manualLinkUrl || derived.linkUrl
  };
}

function normalizeOptionalUrl(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function buildProviderUrls(provider, latitude, longitude) {
  if (provider === "googlemaps") {
    const query = `${latitude},${longitude}`;
    return {
      embedUrl: `https://www.google.com/maps?q=${query}&output=embed`,
      linkUrl: `https://www.google.com/maps?q=${query}`
    };
  }

  const minLon = (longitude - 0.002275).toFixed(6);
  const minLat = (latitude - 0.001299).toFixed(6);
  const maxLon = (longitude + 0.002325).toFixed(6);
  const maxLat = (latitude + 0.001301).toFixed(6);
  return {
    embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`,
    linkUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`
  };
}
