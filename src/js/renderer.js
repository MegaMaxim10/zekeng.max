export function renderPage(page, root) {
    let html = "";

    if (page.header) {
    html += renderHeader(page.header);
    }

    html += `<main class="content">`;

    page.body.forEach(block => {
    html += renderBlock(block);
    });

    html += `</main>`;

    if (page.footer) {
    html += renderFooter(page.footer);
    }

    root.innerHTML = html;
}

function renderHeader(header) {
  return `
    <header class="page-header">
      <h1>${escapeHtml(header.title)}</h1>
      ${header.subtitle ? `<h2>${escapeHtml(header.subtitle)}</h2>` : ""}
      ${header.lead ? `<p class="lead">${escapeHtml(header.lead)}</p>` : ""}
      ${header.image ? `
        <img src="${header.image.src}"
             alt="${escapeHtml(header.image.alt || "")}" />
      ` : ""}
    </header>
  `;
}

function renderBlock(block) {
  switch (block.type) {
    case "paragraph":
      return renderParagraph(block);
    case "heading":
      return renderHeading(block);
    case "list":
      return renderList(block);
    case "timeline":
      return renderTimeline(block);
    case "link":
      return renderLink(block);
    case "card-grid":
      return renderCardGrid(block);
    case "asset":
      return renderAsset(block);
    case "form":
      return renderForm(block);
    default:
      throw new Error(`Unsupported block type: ${block.type}`);
  }
}

function renderParagraph(block) {
  return `
    <p class="${renderStyles(block)}">
      ${escapeHtml(block.data.text)}
    </p>
  `;
}

function renderHeading(block) {
  const level = block.data.level;
  return `
    <h${level} class="${renderStyles(block)}">
      ${escapeHtml(block.data.text)}
    </h${level}>
  `;
}

function renderList(block) {
  const items = block.data.items
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `
    <ul class="${renderStyles(block)}">
      ${items}
    </ul>
  `;
}

function renderTimeline(block) {
  const items = block.data.items.map(item => `
    <div class="timeline-item">
      <div class="timeline-period">${escapeHtml(item.period)}</div>
      <div class="timeline-content">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>
    </div>
  `).join("");

  return `
    <section class="timeline ${renderStyles(block)}">
      ${items}
    </section>
  `;
}

function renderLink(block) {
  const target = block.data.external ? "_blank" : "_self";

  return `
    <a href="${block.data.url}"
       target="${target}"
       class="link ${renderStyles(block)}">
      ${escapeHtml(block.data.label)}
    </a>
  `;
}

function renderCardGrid(block) {
  const cards = block.data.cards.map(card => `
    <div class="card">
      ${card.image ? `<img src="${card.image}" alt="">` : ""}
      <h3>${escapeHtml(card.title)}</h3>
      ${card.description ? `<p>${escapeHtml(card.description)}</p>` : ""}
      ${card.link ? `<a href="${card.link}">Learn more</a>` : ""}
    </div>
  `).join("");

  return `
    <section class="card-grid ${renderStyles(block)}">
      ${cards}
    </section>
  `;
}

function renderAsset(block) {
  return `
    <div class="asset asset-${block.data.kind}">
      <a href="${block.data.src}" target="_blank">
        ${escapeHtml(block.data.label || "Download")}
      </a>
    </div>
  `;
}

function renderForm(block) {
  const fields = block.data.fields.map(field => `
    <label>
      ${escapeHtml(field.label)}
      ${
        field.type === "textarea"
          ? `<textarea name="${field.name}" ${field.required ? "required" : ""}></textarea>`
          : `<input type="${field.type || "text"}"
                   name="${field.name}"
                   ${field.required ? "required" : ""} />`
      }
    </label>
  `).join("");

  return `
    <form class="contact-form"
          method="POST"
          action="${block.data.endpoint}">
      ${fields}
      <button type="submit">Send</button>
    </form>
  `;
}

function renderFooter(footer) {
  return `
    <footer class="page-footer">
      ${footer.notes ? `<p>${escapeHtml(footer.notes)}</p>` : ""}
    </footer>
  `;
}

function renderStyles(block) {
  return block.style ? block.style.join(" ") : "";
}

function escapeHtml(text) {
  return String(text).replaceAll(/[&<>"']/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[ch]
  );
}


