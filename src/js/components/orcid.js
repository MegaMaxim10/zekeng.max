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
      return {
        doi: id.externalIdentifierId?.value,
        url: `https://doi.org/${id.externalIdentifierId?.value}`
      };
    }
  }
  return null;
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

/**
 * Render a single work/publication
 */
function renderWork(work) {
  const doi = getDoiLink(work.externalIds);
  const year = work.publicationDate?.year?.value || "N/A";
  const month = work.publicationDate?.month?.value;
  const day = work.publicationDate?.day?.value;
  
  // Format full publication date
  let pubDate = year;
  if (month) {
    const monthName = new Date(2000, parseInt(month) - 1).toLocaleString('en', { month: 'long' });
    pubDate = `${monthName} ${year}`;
    if (day) {
      pubDate = `${day} ${monthName} ${year}`;
    }
  }

  // Build contributor list
  let contributorsList = "";
  if (work.contributors && work.contributors.length > 0) {
    const authors = work.contributors
      .filter(c => c.name)
      .map(c => escapeHtml(c.name))
      .join(", ");
    if (authors) {
      contributorsList = `<div class="work-contributors">
        <strong>Authors:</strong> <span class="author-list">${authors}</span>
      </div>`;
    }
  }

  // Build citation section
  let citationSection = "";
  if (work.citation) {
    citationSection = `<div class="work-citation">
      <strong>Citation:</strong>
      <p class="citation-text">${escapeHtml(work.citation)}</p>
    </div>`;
  }

  return `
    <article class="orcid-work">
      <h4 class="work-title">${escapeHtml(work.title)}</h4>
      ${work.subtitle ? `<p class="work-subtitle">${escapeHtml(work.subtitle)}</p>` : ""}
      
      <div class="work-metadata">
        <span class="work-type">${getWorkTypeLabel(work.type)}</span>
        <span class="work-date">${escapeHtml(pubDate)}</span>
        ${work.journalTitle ? `<span class="work-journal">${escapeHtml(work.journalTitle)}</span>` : ""}
      </div>
      
      ${contributorsList}
      
      ${work.description ? `<p class="work-description">${escapeHtml(work.description)}</p>` : ""}
      
      <div class="work-identifiers">
        ${doi ? `<span class="identifier doi">DOI: <a href="${escapeHtml(doi.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(doi.doi)}</a></span>` : ""}
      </div>
      
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
function renderWorksSection(works) {
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
  for (const [type, typeWorks] of Object.entries(groupedByType)) {
    html += `<section class="work-group work-type-${type}">
      <h3>${getWorkTypeLabel(type)}</h3>
      <div class="work-list">
        ${typeWorks.map(renderWork).join("")}
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
    const period = startDate && endDate ? `${startDate} – ${endDate}` : "Dates not specified";

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
    const period = startDate && endDate ? `${startDate} – ${endDate}` : "Dates not specified";

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
        <div class="review-meta">
          <span class="review-date">${formatDate(review.completionDate) || "Date not specified"}</span>
          <span class="review-org">${escapeHtml(review.organization)}</span>
        </div>
        <p class="review-role">${escapeHtml(review.role || "Reviewer")}</p>
        <p class="review-type">${escapeHtml(review.reviewType || "Review")}</p>
        ${review.reviewUrl ? `<a href="${escapeHtml(review.reviewUrl)}" target="_blank" rel="noopener noreferrer" class="review-link">View Review</a>` : ""}
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
    const period = startDate && endDate ? `${startDate} – ${endDate}` : "Dates not specified";

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
    const period = startDate && endDate ? `${startDate} – ${endDate}` : "Dates not specified";

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
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <p class="timeline-period">${escapeHtml(item.period)}</p>
          <h4 class="timeline-title">${escapeHtml(item.title)}</h4>
          ${item.description ? `<div class="timeline-description">${item.description}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  return `<div class="timeline">${items}</div>`;
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
              ${renderWorksSection(orcidSections.works)}
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
