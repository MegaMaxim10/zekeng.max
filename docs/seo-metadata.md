# SEO And Social Metadata

The framework generates SEO and social tags at build time for every page.

## Generated Tags

- `meta name="description"`
- `meta name="keywords"`
- `meta name="author"`
- `meta name="robots"`
- `link rel="canonical"`
- Open Graph:
  - `og:title`
  - `og:description`
  - `og:type`
  - `og:url`
  - `og:site_name`
  - `og:locale`
  - `og:image`
  - `article:published_time` (when provided)
  - `article:modified_time` (when provided)
- Twitter:
  - `twitter:card`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
  - `twitter:site` (when configured)
- JSON-LD:
  - `WebPage`
  - optional `Person` graph node (from framework config)

## Framework Defaults

Set global defaults in `framework.config.json`:

```json
{
  "seo": {
    "siteUrl": "https://example.com",
    "defaultLocale": "en_US",
    "defaultType": "website",
    "defaultRobots": "index,follow",
    "defaultImage": "/assets/images/og-default.jpg",
    "twitterHandle": "@example",
    "organizationName": "Example Name",
    "sameAs": [
      "https://orcid.org/0000-0000-0000-0000",
      "https://www.linkedin.com/in/example"
    ]
  }
}
```

## Per-Page Declarative Overrides

In each page JSON:

```json
{
  "meta": {
    "title": "Publications",
    "description": "Selected publications and research outputs.",
    "tags": ["research", "publications"],
    "canonical": "/3-research/1-publications/publications.html",
    "image": "/assets/images/publications-og.jpg",
    "robots": "index,follow",
    "publishedTime": "2025-06-15T08:30:00Z",
    "modifiedTime": "2026-02-19T09:00:00Z",
    "social": {
      "title": "Publications | My Portfolio",
      "description": "Research papers, journal articles, and conference outputs.",
      "image": "/assets/images/publications-social.jpg",
      "type": "article",
      "card": "summary_large_image"
    }
  }
}
```

## Resolution Rules

At build time, values resolve in this order:

1. Page-level `meta.social.*` or `meta.*`
2. Framework `seo` defaults in `framework.config.json`
3. Global site defaults (`siteData` in `src/js/renderer.js`)

Descriptions are automatically trimmed to an SEO-friendly length.
