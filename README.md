# Static Portfolio Framework

A schema-driven static site framework for academic and professional portfolios.

It converts structured JSON content into production-ready static HTML/CSS/JS, with:
- declarative page components
- config-driven content references (`cfg` and `hook` tokens)
- generated navigation/breadcrumb/related links
- configurable templates, styles, scripts, and SEO
- framework runtime behavior separated from developer custom code

## What This Framework Is

This project is a static site framework, not a theme-only starter.

You define content as JSON files in `content/`.  
The build system validates JSON against `schemas/page.schema.json`, renders component blocks, applies templates, copies assets, and minifies output into `public/`.

## Core Principles

1. Content-first: content is data (`.json`) and validated before build.
2. Declarative presentation: templates/styles/scripts are selected in config, not hardcoded per page.
3. Framework vs custom separation: reusable framework logic stays in `src/js/framework`; developer-specific logic stays in `src/js/custom`.

## Quick Start

### Requirements
- Node.js 18+
- npm

### Install

```bash
npm install
```

### Main Commands

```bash
# validate all content JSON files
npm run validate:content

# run test suite
npm test

# build site into public/
npm run build

# full pipeline
npm run validate-test-and-build
```

Open `public/index.html` after build.

## Build Pipeline

1. Load and merge `framework.config.json` with framework defaults.
2. Resolve content references (`{{cfg:...}}`, `{{hook:...}}`) in page JSON.
3. Validate resolved content against `schemas/page.schema.json`.
4. Build site graph from `content/` directory structure.
5. Render page blocks via component renderers in `src/js/components/`.
6. Apply selected template and inject navigation/breadcrumb/related links.
7. Generate SEO/social tags and structured data.
8. Copy static assets and framework/custom scripts.
9. Minify final output.

## Project Structure

```text
content/                    Page content JSON
schemas/                    JSON schema definitions
scripts/                    Build pipeline modules
src/
  css/                      Framework styles
  js/
    components/             Block renderers (paragraph, form, map, ...)
    framework/              Framework runtime behavior modules
    custom/                 Developer-owned runtime hooks
    renderer.js             Block dispatch and page rendering
  templates/                HTML templates
assets/                     Static images/documents/icons
public/                     Build output
framework.config.json       Main framework customization file
```

## Configuration Overview

Main configuration file: `framework.config.json`

Top-level sections:
- `site`: site title, author, contact/social metadata used by build and footer.
- `templates`: template references and named entries.
- `styles`: style profiles and default profile.
- `scripts`: default scripts (supports classic and ES module entries).
- `seo`: global SEO/social defaults.

See:
- `docs/templating-and-styling.md`
- `docs/seo-metadata.md`
- `docs/components-reference.md`
- `docs/content-references.md`
- `docs/style-reference.md`
- `docs/runtime-and-scripts.md`

## Content Authoring Model

Each page uses this shape:

```json
{
  "meta": {
    "id": "contact",
    "title": "Contact",
    "language": "en"
  },
  "header": {
    "title": "Contact",
    "lead": "Get in touch."
  },
  "body": [
    { "type": "paragraph", "data": { "text": "Hello" } }
  ],
  "footer": {
    "notes": "Optional page footer notes"
  }
}
```

Supported block types are documented in detail in `docs/components-reference.md`.

### Content References (`cfg` and `hook`)

Content JSON can reference configuration values and computed values:

- `{{cfg:site.contact.fullName}}` -> reads directly from `framework.config.json`
- `{{hook:contact.phoneTelUrl(0)}}` -> resolves through framework hooks

Resolution happens before validation and rendering, so referenced values behave like normal JSON content values.

## Framework Runtime vs Custom Runtime

Framework runtime entry:
- `src/js/framework/runtime.js`

Developer runtime entry:
- `src/js/custom/global.js`

By default, both are loaded. Framework code handles reusable behavior (theme/nav/form/dialog/etc).  
Developer code should only contain project-specific behavior.

## Form System Highlights

The `form` block supports:
- required markers
- field help text
- declarative validation (`minLength`, `pattern`, ranges, ...)
- declarative custom messages (`required`, `tooShort`, ...)
- provider-specific behavior (for example Formspree with anti-bot challenge and confirmation dialog)

See `docs/components-reference.md` for full form schema and examples.

## Deployment

This is static output, deployable anywhere:
- GitHub Pages
- Netlify
- Vercel
- S3/CloudFront
- nginx/Apache static hosting

If deploying under a sub-path:

```bash
BASE_PATH=/portfolio npm run build
```

## Testing

Tests are in:
- `tests/renderer/` component rendering tests
- `tests/scripts/` build/navigation/graph tests

Run:

```bash
npm test
```

## License

MIT
