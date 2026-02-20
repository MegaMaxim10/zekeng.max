# Components Reference

This document describes every supported `body` block type.

All string fields in page JSON may use content-reference tokens:
- `{{cfg:...}}`
- `{{hook:...}}`

Reference details: `docs/content-references.md`

Each block follows:

```json
{
  "type": "block-type",
  "id": "optional-id",
  "style": ["optional", "custom-class"],
  "data": {}
}
```

## `paragraph`

Purpose: plain text paragraph (HTML escaped).

```json
{
  "type": "paragraph",
  "data": { "text": "Short biography text." }
}
```

## `heading`

Purpose: semantic heading in content area.

```json
{
  "type": "heading",
  "data": { "level": 2, "text": "Research Interests" }
}
```

## `list`

Purpose: bullet list.

```json
{
  "type": "list",
  "data": {
    "items": ["Software Engineering", "Workflows", "Formal Methods"]
  }
}
```

## `timeline`

Purpose: chronological entries.

```json
{
  "type": "timeline",
  "data": {
    "items": [
      {
        "period": "2023-Now",
        "title": "Senior Lecturer",
        "description": "University role and scope."
      }
    ]
  }
}
```

## `link`

Purpose: explicit CTA link.

```json
{
  "type": "link",
  "data": {
    "label": "Visit Profile",
    "url": "https://example.org",
    "external": true
  }
}
```

## `card-grid`

Purpose: responsive cards.

```json
{
  "type": "card-grid",
  "data": {
    "cards": [
      {
        "title": "Project A",
        "description": "Short description",
        "image": "assets/images/research/a.jpg",
        "link": "https://example.org/a"
      }
    ]
  }
}
```

## `asset`

Purpose: download/document/image references.

```json
{
  "type": "asset",
  "data": {
    "kind": "pdf",
    "src": "assets/documents/cv/cv.pdf",
    "label": "Download CV"
  }
}
```

## `form`

Purpose: generic HTML form with framework validation hooks.

Required:
- `provider`
- `endpoint`
- `fields[]`

Field options:
- `name`, `label`, `type`, `required`
- `placeholder`, `autocomplete`, `helpText`
- `validation`: `minLength`, `maxLength`, `pattern`, `min`, `max`, `step`
- `messages`: custom error messages by validity key

Example:

```json
{
  "type": "form",
  "data": {
    "provider": "formspree",
    "endpoint": "https://formspree.io/f/xxxxxxx",
    "fields": [
      {
        "name": "email",
        "label": "Your email",
        "type": "email",
        "required": true,
        "placeholder": "name@example.com",
        "autocomplete": "email",
        "validation": { "minLength": 6 },
        "messages": {
          "required": "Please provide your email address.",
          "typeMismatch": "Please enter a valid email address."
        }
      },
      {
        "name": "message",
        "label": "Message",
        "type": "textarea",
        "required": true,
        "validation": { "minLength": 20 }
      }
    ]
  }
}
```

## `html-content`

Purpose: embed HTML from file.

```json
{
  "type": "html-content",
  "data": {
    "url": "src/content/carroussel.html"
  }
}
```

## `map`

Purpose: embeddable location map with metadata.

```json
{
  "type": "map",
  "data": {
    "title": "Office map",
    "provider": "openstreetmap",
    "embedUrl": "https://www.openstreetmap.org/export/embed.html?...",
    "linkUrl": "https://www.openstreetmap.org/?mlat=...&mlon=...",
    "address": "Campus C, Faculty of Science",
    "latitude": 5.438799,
    "longitude": 10.071175,
    "height": 380
  }
}
```

## `link-groups`

Purpose: categorized multi-column links with optional icons.

```json
{
  "type": "link-groups",
  "data": {
    "title": "Profiles",
    "columns": 2,
    "groups": [
      {
        "title": "Professional",
        "links": [
          {
            "label": "GitHub",
            "url": "https://github.com/example",
            "external": true,
            "icon": "github"
          }
        ]
      }
    ]
  }
}
```

## `orcid`

Purpose: pull and render ORCID profile sections.

```json
{
  "type": "orcid",
  "data": {
    "orcidId": "0000-0002-0417-5591",
    "sections": ["works", "education", "employment"],
    "filters": {
      "workType": ["journal-article"],
      "sortBy": "date-desc",
      "limit": 20
    }
  }
}
```

## Tips

1. Use `style` to apply page-specific custom classes without editing framework CSS.
2. Use `cfg`/`hook` tokens to avoid duplicating contact/profile data in multiple pages.
3. Validate content with `npm run validate:content` after block edits.

