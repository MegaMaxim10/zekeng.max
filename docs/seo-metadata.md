# SEO And Social Metadata

SEO metadata is generated at build time for every page.

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
  - `article:published_time` (if provided)
  - `article:modified_time` (if provided)
- Twitter:
  - `twitter:card`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
  - `twitter:site` (if configured)
- JSON-LD:
  - `WebPage`
  - optional `Person` node

## Framework Defaults

Configured in `framework.config.json`:

```json
{
  "site": {
    "title": "My Portfolio",
    "description": "Default site description",
    "author": "Author Name",
    "keywords": ["portfolio", "research"]
  },
  "seo": {
    "siteUrl": "https://example.com",
    "defaultLocale": "en_US",
    "defaultType": "website",
    "defaultRobots": "index,follow",
    "defaultImage": "/assets/images/og-default.jpg",
    "twitterHandle": "@example",
    "organizationName": "Author Name",
    "sameAs": [
      "https://orcid.org/0000-0000-0000-0000",
      "https://www.linkedin.com/in/example"
    ]
  }
}
```

## Per-Page Overrides

Use `meta` in page JSON:

```json
{
  "meta": {
    "title": "Publications",
    "description": "Selected publications and outputs.",
    "tags": ["research", "publications"],
    "canonical": "/3-research/1-publications/publications.html",
    "image": "/assets/images/publications-og.jpg",
    "robots": "index,follow",
    "publishedTime": "2025-06-15T08:30:00Z",
    "modifiedTime": "2026-02-19T09:00:00Z",
    "social": {
      "title": "Publications | My Portfolio",
      "description": "Research papers and conference outputs.",
      "image": "/assets/images/publications-social.jpg",
      "type": "article",
      "card": "summary_large_image"
    }
  }
}
```

## Resolution Order

At build time, values resolve as:
1. page-level `meta.social.*` or `meta.*`
2. framework-level `seo.*` defaults
3. framework-level `site.*` defaults

Descriptions are automatically trimmed to an SEO-friendly length.

If page `meta.*` values contain content-reference tokens (`cfg`/`hook`), they are resolved first, before SEO generation.
