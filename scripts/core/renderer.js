import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { renderParagraph } from "./components/paragraph.js";
import { renderHeading } from "./components/heading.js";
import { renderList } from "./components/list.js";
import { renderTimeline } from "./components/timeline.js";
import { renderLink } from "./components/link.js";
import { renderCardGrid } from "./components/card-grid.js";
import { renderAsset } from "./components/asset.js";
import { renderForm } from "./components/form.js";
import { renderHtmlContent } from "./components/html-content.js";
import { renderOrcid } from "./components/orcid.js";
import { renderMap } from "./components/map.js";
import { renderLinkGroups } from "./components/link-groups.js";
import { renderLayoutRow } from "./components/layout-row.js";
import { renderFeatureImage } from "./components/feature-image.js";

export function renderPage(page) {
    let html = "";

    if (page.header) {
    html += renderHeader(page.header);
    }

    html += `<main class="content">`;

    page.body.forEach(block => {
    html += renderBlock(block);
    });

    html += `</main>\n`;

    if (page.footer) {
    html += renderFooter(page.footer);
    }

    return html;
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
    case "html-content":
      return renderHtmlContent(block);
    case "orcid":
      return renderOrcid(block);
    case "map":
      return renderMap(block);
    case "link-groups":
      return renderLinkGroups(block);
    case "layout-row":
      return renderLayoutRow(block, renderBlock);
    case "feature-image":
    case "profile-image":
      return renderFeatureImage(block);
    default:
      throw new Error(`Unsupported block type: ${block.type}`);
  }
}
