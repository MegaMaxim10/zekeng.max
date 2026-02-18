import { escapeHtml, renderStyles } from "../utils/render-utils.js";

/**
 * Format a date object from ORCID API into readable format
 */
function formatDate(dateObj) {
  if (!dateObj) return "";
  const year = dateObj.year?.value;
  const month = dateObj.month?.value;
  const day = dateObj.day?.value;

  if (!year) return "";
  if (!month) return year;
  if (!day) return `${month.padStart(2, "0")}/${year}`;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

/**
 * Get DOI link from external IDs
 */
function getDoiLink(externalIds) {
  if (!externalIds?.externalIdentifier) return null;

  for (const id of externalIds.externalIdentifier) {
    if (id.externalIdentifierType?.toLowerCase() === "doi") {
      const rawDoi = (id.externalIdentifierId?.value || "").trim();
      const normalizedDoi = rawDoi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
      return {
        doi: normalizedDoi || rawDoi,
        url: `https://doi.org/${normalizedDoi || rawDoi}`
      };
    }
  }
  return null;
}

function getExternalIdentifierList(externalIds) {
  if (!externalIds?.externalIdentifier) return [];

  return externalIds.externalIdentifier
    .map((id) => ({
      type: (id.externalIdentifierType || "ID").toUpperCase(),
      value: id.externalIdentifierId?.value || "",
      url: id.externalIdentifierUrl?.value || ""
    }))
    .filter((id) => id.value);
}

/**
 * Classify work type for display
 */
function getWorkTypeLabel(workType) {
  const typeMap = {
    "journal-article": "Journal Article",
    "conference-paper": "Conference Paper",
    "book": "Book",
    "book-chapter": "Book Chapter",
    "dissertation": "Dissertation",
    "report": "Report",
    "other": "Other"
  };
  return typeMap[workType?.toLowerCase()] || "Work";
}

function formatLabel(value, fallback = "") {
  if (!value) return fallback;
  return String(value)
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatContributorList(contributors = []) {
  const authorNames = contributors
    .filter((c) => c?.name)
    .sort((a, b) => {
      const aSeq = a.sequence === "first" ? 0 : 1;
      const bSeq = b.sequence === "first" ? 0 : 1;
      return aSeq - bSeq;
    })
    .map((c) => c.name.trim());
  return authorNames;
}

function splitName(fullName) {
  if (!fullName) return { given: [], family: "" };
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { given: [], family: "" };
  if (parts.length === 1) return { given: [], family: parts[0] };
  const family = parts.pop();
  return { given: parts, family };
}

function toVancouverName(fullName) {
  const { given, family } = splitName(fullName);
  if (!family) return "";
  const initials = given.map((name) => name[0].toUpperCase()).join("");
  return `${family} ${initials}`.trim();
}

function toIeeeName(fullName) {
  const { given, family } = splitName(fullName);
  if (!family) return "";
  const initials = given.map((name) => `${name[0].toUpperCase()}.`).join(" ");
  return `${initials}${initials ? " " : ""}${family}`.trim();
}

function formatAuthorSeries(authors) {
  if (authors.length === 0) return "";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")}, and ${authors[authors.length - 1]}`;
}

function buildGeneratedVancouverCitation(work, doiLink, citationIndex) {
  const authors = formatAuthorSeries(
    formatContributorList(work.contributors).map(toVancouverName).filter(Boolean)
  );
  const title = work.title || "Untitled work";
  const journal = work.journalTitle || "";
  const year = work.publicationDate?.year?.value || "n.d.";
  const volume = work.volume || "";
  const issue = work.issue || "";
  const pages = work.pages || "";
  const referenceIndex = citationIndex ? `${citationIndex}. ` : "";

  let journalSegment = journal ? `${journal}. ` : "";
  if (volume) {
    journalSegment += `${year};${volume}`;
    if (issue) {
      journalSegment += `(${issue})`;
    }
    if (pages) {
      journalSegment += `:${pages}`;
    }
    journalSegment += ".";
  } else if (year !== "n.d.") {
    journalSegment += `${year}.`;
  }

  return [
    referenceIndex,
    authors ? `${authors}. ` : "",
    `${title}. `,
    journalSegment,
    doiLink ? ` doi:${doiLink.doi}` : ""
  ].join("").trim();
}

function buildGeneratedIeeeCitation(work, doiLink, citationIndex) {
  const authors = formatAuthorSeries(
    formatContributorList(work.contributors).map(toIeeeName).filter(Boolean)
  );
  const title = work.title || "Untitled work";
  const journal = work.journalTitle || "";
  const year = work.publicationDate?.year?.value || "n.d.";
  const volume = work.volume || "";
  const issue = work.issue || "";
  const pages = work.pages || "";
  const referenceIndex = citationIndex ? `[${citationIndex}] ` : "";

  const segments = [];
  if (journal) segments.push(journal);
  if (volume) segments.push(`vol. ${volume}`);
  if (issue) segments.push(`no. ${issue}`);
  if (pages) segments.push(`pp. ${pages}`);
  if (year !== "n.d.") segments.push(year);
  if (doiLink) segments.push(`doi: ${doiLink.doi}`);

  return [
    referenceIndex,
    authors ? `${authors}, ` : "",
    `"${title},"`,
    segments.length > 0 ? ` ${segments.join(", ")}.` : ""
  ].join("").trim();
}

function getCitationStyle(displayOptions = {}) {
  const style = (displayOptions.citationStyle || "vancouver").toLowerCase();
  return style === "ieee" ? "ieee" : "vancouver";
}

function resolveWorkDisplayOptions(displayOptions = {}) {
  const defaults = {
    type: true,
    publicationDate: true,
    journalBadge: true,
    authors: true,
    journal: true,
    volume: true,
    issue: true,
    number: true,
    pages: true,
    description: true,
    identifiers: true,
    providedCitation: true,
    generatedCitation: true
  };
  const resolved = { ...defaults };
  const metadataConfig = displayOptions.workMetadata || {};

  for (const key of Object.keys(defaults)) {
    if (typeof metadataConfig[key] === "boolean") {
      resolved[key] = metadataConfig[key];
    }
  }

  const visibleList = Array.isArray(displayOptions.visibleWorkMetadata)
    ? displayOptions.visibleWorkMetadata
    : null;

  if (visibleList && visibleList.length > 0) {
    for (const key of Object.keys(resolved)) {
      resolved[key] = false;
    }
    for (const key of visibleList) {
      if (Object.prototype.hasOwnProperty.call(resolved, key)) {
        resolved[key] = true;
      }
    }
  }

  return resolved;
}

function getCitation(work) {
  if (typeof work.citation === "string") {
    return { type: "plain-text", text: work.citation };
  }

  if (work.citation && typeof work.citation === "object") {
    return {
      type: work.citation["citation-type"] || work.citation.citationType || "",
      text: work.citation["citation-value"] || work.citation.citationValue || ""
    };
  }

  return {
    type: work.citationType || "",
    text: work.citationText || ""
  };
}

/**
 * Render a single work/publication
 */
function renderWork(work, options = {}) {
  const doi = getDoiLink(work.externalIds);
  const externalIdentifiers = getExternalIdentifierList(work.externalIds)
    .filter((id) => id.type !== "DOI");
  const citationStyle = getCitationStyle(options.displayOptions);
  const metadata = resolveWorkDisplayOptions(options.displayOptions);
  const citation = getCitation(work);
  const year = work.publicationDate?.year?.value || "N/A";
  const month = work.publicationDate?.month?.value;
  const day = work.publicationDate?.day?.value;
  const authors = formatContributorList(work.contributors);
  const generatedCitation = citationStyle === "ieee"
    ? buildGeneratedIeeeCitation(work, doi, options.citationIndex)
    : buildGeneratedVancouverCitation(work, doi, options.citationIndex);
  
  let pubDate = year;
  if (month) {
    const monthName = new Date(2000, parseInt(month, 10) - 1).toLocaleString("en", { month: "long" });
    pubDate = `${monthName} ${year}`;
    if (day) {
      pubDate = `${day} ${monthName} ${year}`;
    }
  }

  let contributorsList = "";
  if (metadata.authors && authors.length > 0) {
    contributorsList = `<div class="work-contributors">
        <strong>Authors:</strong> <span class="author-list">${escapeHtml(authors.join(", "))}</span>
      </div>`;
  }

  const detailItems = [
    ["Journal", metadata.journal ? work.journalTitle : ""],
    ["Volume", metadata.volume ? work.volume : ""],
    ["Issue", metadata.issue ? work.issue : ""],
    ["Number", metadata.number ? work.number : ""],
    ["Pages", metadata.pages ? work.pages : ""]
  ].filter(([, value]) => Boolean(value));

  let detailsSection = "";
  if (detailItems.length > 0) {
    detailsSection = `<dl class="work-detail-grid">
      ${detailItems
        .map(([label, value]) => `
        <div class="work-detail-item">
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(String(value))}</dd>
        </div>
      `)
        .join("")}
    </dl>`;
  }

  let citationSection = "";
  const showProvidedCitation = metadata.providedCitation && Boolean(citation.text);
  const showGeneratedCitation = metadata.generatedCitation && Boolean(generatedCitation);
  if (showProvidedCitation || showGeneratedCitation) {
    citationSection = `<div class="work-citations">
      ${showProvidedCitation ? `
      <div class="work-citation">
        <strong>Provided Citation${citation.type ? ` (${escapeHtml(citation.type.toUpperCase())})` : ""}</strong>
        <p class="citation-text">${escapeHtml(citation.text)}</p>
      </div>` : ""}
      ${showGeneratedCitation ? `
      <div class="work-citation">
        <strong>${citationStyle.toUpperCase()} (generated)</strong>
        <p class="citation-text">${escapeHtml(generatedCitation)}</p>
      </div>` : ""}
    </div>`;
  }

  const identifierItems = [];
  if (doi) {
    identifierItems.push(`<span class="identifier doi">DOI: <a href="${escapeHtml(doi.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(doi.doi)}</a></span>`);
  }
  for (const id of externalIdentifiers) {
    const value = escapeHtml(id.value);
    const label = escapeHtml(id.type);
    if (id.url) {
      identifierItems.push(`<span class="identifier">${label}: <a href="${escapeHtml(id.url)}" target="_blank" rel="noopener noreferrer">${value}</a></span>`);
    } else {
      identifierItems.push(`<span class="identifier">${label}: ${value}</span>`);
    }
  }

  const metadataBadges = [
    metadata.type ? `<span class="work-type">${getWorkTypeLabel(work.type)}</span>` : "",
    metadata.publicationDate ? `<span class="work-date">${escapeHtml(pubDate)}</span>` : "",
    metadata.journalBadge && work.journalTitle ? `<span class="work-journal">${escapeHtml(work.journalTitle)}</span>` : ""
  ].filter(Boolean);

  return `
    <article class="orcid-work">
      <h4 class="work-title">${escapeHtml(work.title)}</h4>
      ${work.subtitle ? `<p class="work-subtitle">${escapeHtml(work.subtitle)}</p>` : ""}
      
      ${metadataBadges.length > 0 ? `<div class="work-metadata">${metadataBadges.join("")}</div>` : ""}
      
      ${contributorsList}
      ${detailsSection}
      
      ${metadata.description && work.description ? `<p class="work-description">${escapeHtml(work.description)}</p>` : ""}
      
      ${metadata.identifiers && identifierItems.length > 0 ? `<div class="work-identifiers">${identifierItems.join("")}</div>` : ""}
      
      ${citationSection}
      
      <div class="work-links">
        ${work.url ? `<a href="${escapeHtml(work.url)}" target="_blank" rel="noopener noreferrer" class="btn-link">View Publication</a>` : ""}
      </div>
    </article>
  `;
}

/**
 * Render works/publications section
 */
function renderWorksSection(works, displayOptions = {}) {
  if (!works || works.length === 0) {
    return "<p class=\"no-data\">No publications available.</p>";
  }

  // Group works by type
  const groupedByType = {};
  for (const work of works) {
    const type = work.type || "other";
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push(work);
  }

  let html = '<div class="orcid-works">';
  let citationIndex = 1;
  for (const [type, typeWorks] of Object.entries(groupedByType)) {
    html += `<section class="work-group work-type-${type}">
      <h3>${getWorkTypeLabel(type)}</h3>
      <div class="work-list">
        ${typeWorks.map((work) => {
          const rendered = renderWork(work, { displayOptions, citationIndex });
          citationIndex += 1;
          return rendered;
        }).join("")}
      </div>
    </section>`;
  }
  html += "</div>";

  return html;
}

/**
 * Render education records
 */
function renderEducationSection(educations) {
  if (!educations || educations.length === 0) {
    return "<p class=\"no-data\">No education records available.</p>";
  }

  const items = educations.map(edu => {
    const startDate = formatDate(edu.startDate);
    const endDate = edu.endDate ? formatDate(edu.endDate) : "Present";
    const period = startDate && endDate ? `${startDate} - ${endDate}` : "Dates not specified";

    return {
      period,
      title: escapeHtml(edu.degree || edu.institution),
      description: edu.institution
        ? `<p class="institution">${escapeHtml(edu.institution)}</p>${edu.field ? `<p class="field">${escapeHtml(edu.field)}</p>` : ""}`
        : ""
    };
  });

  const timelineJson = { items };
  return renderTimeline(timelineJson);
}

/**
 * Render employment records
 */
function renderEmploymentSection(employments) {
  if (!employments || employments.length === 0) {
    return "<p class=\"no-data\">No employment records available.</p>";
  }

  const items = employments.map(emp => {
    const startDate = formatDate(emp.startDate);
    const endDate = emp.endDate ? formatDate(emp.endDate) : "Present";
    const period = startDate && endDate ? `${startDate} - ${endDate}` : "Dates not specified";

    return {
      period,
      title: escapeHtml(emp.position || emp.organization),
      description: emp.organization
        ? `<p class="organization">${escapeHtml(emp.organization)}</p>${emp.department ? `<p class="department">${escapeHtml(emp.department)}</p>` : ""}`
        : ""
    };
  });

  const timelineJson = { items };
  return renderTimeline(timelineJson);
}

/**
 * Render peer reviews section
 */
function renderPeerReviewsSection(reviews) {
  if (!reviews || reviews.length === 0) {
    return "<p class=\"no-data\">No peer review records available.</p>";
  }

  return `<div class="orcid-peer-reviews">
    ${reviews.map(review => `
      <article class="peer-review">
        <header class="review-header">
          <div class="review-heading">
            <h3 class="review-title">${escapeHtml(formatLabel(review.reviewType, "Review"))}</h3>
            <p class="review-org">${escapeHtml(review.organization || "Unknown organization")}</p>
          </div>
          <span class="review-date">${formatDate(review.completionDate) || "Date not specified"}</span>
        </header>
        <div class="review-badges">
          <span class="review-badge">${escapeHtml(formatLabel(review.role, "Reviewer"))}</span>
          <span class="review-badge">${escapeHtml(formatLabel(review.type, "Peer review"))}</span>
        </div>
        <dl class="review-detail-grid">
          ${review.subjectName ? `
            <div class="review-detail-item">
              <dt>Subject</dt>
              <dd>${escapeHtml(review.subjectName)}</dd>
            </div>` : ""}
          ${review.subjectType ? `
            <div class="review-detail-item">
              <dt>Subject Type</dt>
              <dd>${escapeHtml(formatLabel(review.subjectType))}</dd>
            </div>` : ""}
          ${review.groupId ? `
            <div class="review-detail-item">
              <dt>Group ID</dt>
              <dd>${escapeHtml(String(review.groupId))}</dd>
            </div>` : ""}
          ${review.reviewJournal ? `
            <div class="review-detail-item">
              <dt>Journal</dt>
              <dd>${escapeHtml(String(review.reviewJournal))}</dd>
            </div>` : ""}
        </dl>
        <div class="review-links">
          ${review.subjectUrl ? `<a href="${escapeHtml(review.subjectUrl)}" target="_blank" rel="noopener noreferrer" class="review-link">View Subject</a>` : ""}
          ${review.reviewUrl ? `<a href="${escapeHtml(review.reviewUrl)}" target="_blank" rel="noopener noreferrer" class="review-link">View Review Record</a>` : ""}
        </div>
      </article>
    `).join("")}
  </div>`;
}

/**
 * Render grants section
 */
function renderGrantsSection(grants) {
  if (!grants || grants.length === 0) {
    return "<p class=\"no-data\">No grants available.</p>";
  }

  const items = grants.map(grant => {
    const startDate = formatDate(grant.startDate);
    const endDate = grant.endDate ? formatDate(grant.endDate) : "Present";
    const period = startDate && endDate ? `${startDate} - ${endDate}` : "Dates not specified";

    return {
      period,
      title: escapeHtml(grant.title),
      description: `<p class="grant-org">${escapeHtml(grant.organization)}</p>${grant.amount ? `<p class="grant-amount">${escapeHtml(grant.currency || "")} ${escapeHtml(grant.amount)}</p>` : ""}${grant.description ? `<p class="grant-desc">${escapeHtml(grant.description)}</p>` : ""}`
    };
  });

  const timelineJson = { items };
  return renderTimeline(timelineJson);
}

/**
 * Render professional activities section
 */
function renderProfessionalActivitiesSection(activities) {
  if (!activities || activities.length === 0) {
    return "<p class=\"no-data\">No professional activities available.</p>";
  }

  const items = activities.map(activity => {
    const startDate = formatDate(activity.startDate);
    const endDate = activity.endDate ? formatDate(activity.endDate) : "Present";
    const period = startDate && endDate ? `${startDate} - ${endDate}` : "Dates not specified";

    return {
      period,
      title: escapeHtml(activity.role),
      description: `<p class="activity-org">${escapeHtml(activity.organization)}</p>${activity.description ? `<p class="activity-desc">${escapeHtml(activity.description)}</p>` : ""}`
    };
  });

  const timelineJson = { items };
  return renderTimeline(timelineJson);
}

/**
 * Simple timeline renderer (used by education, employment, etc.)
 * Matches existing timeline component pattern
 */
function renderTimeline(data) {
  if (!data.items || data.items.length === 0) {
    return "";
  }

  const items = data.items.map(item => {
    return `
      <div class="timeline-item">
        <div class="timeline-period">${escapeHtml(item.period)}</div>
        <div class="timeline-content">
          <strong class="timeline-title">${escapeHtml(item.title)}</strong>
          ${item.description ? `<div class="timeline-description">${item.description}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  return `<div class="timeline block-timeline">${items}</div>`;
}

/**
 * Main ORCID component renderer
 */
export function renderOrcid(block) {
  const data = block.data || {};
  const cachedData = data.cachedData || {};
  const sections = data.sections || [];
  const orcidId = data.orcidId || "unknown";
  const displayOptions = data.displayOptions || {};
  const showTitle = displayOptions.showTitle !== false;

  let html = `
    <section class="orcid-profile ${renderStyles(block)}">
  `;

  if (showTitle) {
    html += `
      <div class="orcid-header">
        <p class="orcid-notice">Data retrieved from <a href="https://orcid.org/${orcidId}" target="_blank" rel="noopener noreferrer">ORCID Profile</a></p>
      </div>
    `;
  }

  // If no data was fetched, show empty state
  if (!cachedData.sections || Object.keys(cachedData.sections).length === 0) {
    html += `<p class="orcid-loading">Loading ORCID data...</p>`;
    html += `</section>`;
    return html;
  }

  const orcidSections = cachedData.sections;

  // Determine which sections to render
  const sectionsToRender = sections.length > 0 ? sections : Object.keys(orcidSections);

  for (const section of sectionsToRender) {
    switch (section) {
      case "works":
        if (orcidSections.works) {
          html += `
            <div class="orcid-section works-section">
              <h2>Publications</h2>
              ${renderWorksSection(orcidSections.works, displayOptions)}
            </div>
          `;
        }
        break;

      case "education":
        if (orcidSections.education) {
          html += `
            <div class="orcid-section education-section">
              <h2>Education</h2>
              ${renderEducationSection(orcidSections.education)}
            </div>
          `;
        }
        break;

      case "employment":
        if (orcidSections.employment) {
          html += `
            <div class="orcid-section employment-section">
              <h2>Employment</h2>
              ${renderEmploymentSection(orcidSections.employment)}
            </div>
          `;
        }
        break;

      case "peer-review":
        if (orcidSections.peerReviews) {
          html += `
            <div class="orcid-section peer-review-section">
              <h2>Peer Reviews</h2>
              ${renderPeerReviewsSection(orcidSections.peerReviews)}
            </div>
          `;
        }
        break;

      case "grants":
        if (orcidSections.grants) {
          html += `
            <div class="orcid-section grants-section">
              <h2>Grants</h2>
              ${renderGrantsSection(orcidSections.grants)}
            </div>
          `;
        }
        break;

      case "professional-activity":
        if (orcidSections.professionalActivities) {
          html += `
            <div class="orcid-section professional-activities-section">
              <h2>Professional Activities</h2>
              ${renderProfessionalActivitiesSection(orcidSections.professionalActivities)}
            </div>
          `;
        }
        break;
    }
  }

  html += `</section>`;
  return html;
}
