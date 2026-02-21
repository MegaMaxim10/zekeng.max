import { escapeHtml, renderStyles } from "../utils/render-utils.js";

export function renderLinkGroups(block) {
  const data = block.data || {};
  const classes = ["link-groups", "block-link-groups", renderStyles(block)].filter(Boolean).join(" ");
  const columns = Number.isInteger(data.columns) ? Math.max(1, Math.min(data.columns, 4)) : 2;

  const groups = (data.groups || []).map((group) => {
    const links = (group.links || []).map((link) => {
      const external = link.external !== false;
      const href = escapeHtml(resolveLinkHref(link.url || "#", external));
      const targetAttrs = external ? ` target="_blank" rel="noopener noreferrer"` : "";
      const icon = renderLinkIcon(link.icon || inferIconKey(link.url || ""));

      return `
        <li class="link-groups-item">
          <a class="link-groups-link" href="${href}"${targetAttrs}>
            ${icon}
            <span class="link-groups-label">${escapeHtml(link.label || link.url || "")}</span>
          </a>
        </li>
      `;
    }).join("");

    return `
      <article class="link-group">
        ${group.title ? `<h3>${escapeHtml(group.title)}</h3>` : ""}
        <ul class="link-groups-list">
          ${links}
        </ul>
      </article>
    `;
  }).join("");

  return `
    <section class="${classes}" style="--link-group-columns: ${columns};">
      ${data.title ? `<h2>${escapeHtml(data.title)}</h2>` : ""}
      <div class="link-groups-grid">
        ${groups}
      </div>
    </section>
  `;
}

function inferIconKey(url) {
  const text = String(url || "").toLowerCase();
  if (text.startsWith("mailto:")) return "email";
  if (text.startsWith("tel:")) return "phone";
  if (text.includes("wa.me") || text.includes("whatsapp")) return "whatsapp";
  if (text.includes("github.com")) return "github";
  if (text.includes("linkedin.com")) return "linkedin";
  if (text.includes("x.com") || text.includes("twitter.com")) return "x";
  if (text.includes("researchgate.net")) return "researchgate";
  if (text.includes("orcid.org")) return "orcid";
  if (text.includes("scholar.google.com")) return "googlescholar";
  if (text.includes("contact")) return "contact";
  return "link";
}

function renderLinkIcon(iconKey) {
  const key = String(iconKey || "").toLowerCase();
  const icons = {
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.24c1.12.37 2.31.56 3.55.56a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.3 22 2 13.7 2 3a1 1 0 0 1 1-1h4.5a1 1 0 0 1 1 1c0 1.24.19 2.43.56 3.55a1 1 0 0 1-.24 1z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.35l-10 6.25L2 6.35V6zm0 2.7V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.7l-9.47 5.92a1 1 0 0 1-1.06 0L2 8.7z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.27-.13-1.58-.78-1.83-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.13-1.12-.41-2.13-1.31-.79-.7-1.32-1.56-1.48-1.82-.16-.27-.02-.41.11-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.13-.6-1.45-.82-1.99-.21-.51-.43-.44-.6-.45h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.22 0 1.31.95 2.58 1.08 2.76.13.18 1.86 2.84 4.51 3.98.63.27 1.13.43 1.52.54.64.2 1.22.17 1.68.11.51-.08 1.58-.64 1.8-1.25.22-.61.22-1.14.16-1.25-.07-.11-.25-.18-.52-.31z"/><path d="M20.52 3.49A11.88 11.88 0 0 0 12.06 0C5.55 0 .24 5.3.24 11.82c0 2.08.55 4.12 1.59 5.92L0 24l6.45-1.69a11.77 11.77 0 0 0 5.61 1.43h.01c6.51 0 11.82-5.3 11.82-11.82 0-3.16-1.23-6.12-3.37-8.43Zm-8.46 18.2h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.83 1 1.02-3.73-.24-.38a9.92 9.92 0 0 1-1.51-5.17c0-5.47 4.46-9.92 9.94-9.92 2.65 0 5.14 1.03 7 2.9a9.84 9.84 0 0 1 2.9 7c0 5.48-4.46 9.93-9.93 9.93Z"/></svg>',
    contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 8V7l-3 2-2-1V6l-4-2-4 2v2l-2 1-3-2v1l5 3v3l4 2 4-2v-3l5-3zm-9 6-2-1v-2l2 1 2-1v2l-2 1z"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4l-8 4-8-4z"/></svg>',
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.32c-2.23.49-2.7-.95-2.7-.95-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.81.06 1.24.84 1.24.84.71 1.23 1.87.87 2.33.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.58.82-2.14-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82A7.5 7.5 0 0 1 8 3.8c.68 0 1.37.09 2.01.26 1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.14 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5A2.48 2.48 0 1 0 5 8.46 2.48 2.48 0 0 0 4.98 3.5ZM3 9h4v12H3zm7 0h3.84v1.71h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.66 4.8 6.12V21h-4v-5.52c0-1.32-.02-3.02-1.84-3.02-1.85 0-2.13 1.45-2.13 2.92V21h-4z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2H22l-6.77 7.73L23.2 22h-6.24l-4.88-7.16L5.8 22H2.7l7.24-8.27L1.6 2h6.4l4.4 6.57L18.9 2zM17.8 20h1.73L7.08 3.9H5.22z"/></svg>',
    researchgate: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><text x="12" y="15" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Arial, sans-serif" fill="currentColor">RG</text></svg>',
    orcid: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><text x="12" y="15" text-anchor="middle" font-size="8.5" font-weight="700" font-family="Arial, sans-serif" fill="currentColor">iD</text></svg>',
    googlescholar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 8l11 6 9-4.91V17h2V8L12 2z"/><path d="M6 12.9V17c0 2.76 2.69 5 6 5s6-2.24 6-5v-4.1l-6 3.28-6-3.28z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12a5 5 0 0 1 5-5h3v2h-3a3 3 0 1 0 0 6h3v2h-3a5 5 0 0 1-5-5Zm6.6 1h3v-2h-3v2Zm4.6-6h-3v2h3a3 3 0 0 1 0 6h-3v2h3a5 5 0 0 0 0-10Z"/></svg>'
  };

  return `<span class="link-groups-icon">${icons[key] || icons.link}</span>`;
}

function resolveLinkHref(url, external) {
  const text = String(url || "").trim();
  if (!text) {
    return "#";
  }

  if (!external && isRelativeUrl(text)) {
    return `{{basePath}}/${text.replace(/^\/+/, "")}`;
  }

  return text;
}

function isRelativeUrl(url) {
  return !url.startsWith("{{")
    && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
    && !url.startsWith("//")
    && !url.startsWith("#");
}
