# Templating And Styling Guide

This framework separates **framework-provided** presentation from **developer-customizable** presentation.

## Separation Model

- Framework-provided:
  - Core template contract: `src/templates/page.html`
  - Core styles: `src/css/main.css`, `src/css/components.css`
  - Optional framework styles: `src/css/layout.css`, `src/css/themes.css`
  - Default runtime script: `src/js/custom/global.js`
- Developer-customizable:
  - Per-page presentation config in content JSON (`presentation`)
  - Custom style profiles in `framework.config.json`
  - Custom templates in `src/templates/custom/`
  - Custom styles in `src/css/custom/`
  - Optional per-page extra styles/scripts

## Build-Time Linkage

Linkage happens in `scripts/build.js` at build time:

1. Load `framework.config.json`
2. For each page JSON:
   - Resolve `presentation.template`
   - Resolve `presentation.styleProfile`
   - Add `presentation.extraStyles` and `presentation.extraScripts`
   - Inject `presentation.bodyClass`
3. Render final page through placeholders in template:
   - `{{stylesheets}}`
   - `{{scripts}}`
   - `{{bodyClass}}`

## Declarative Page Presentation

You can add this to any page JSON:

```json
{
  "presentation": {
    "template": "default",
    "styleProfile": "framework-full",
    "bodyClass": "profile-academic",
    "extraStyles": ["assets/css/custom/portfolio-academic.css"],
    "extraScripts": ["assets/js/custom/profile-interactions.js"]
  }
}
```

## `framework.config.json`

Use this file to define style/template options exposed by the framework.

```json
{
  "templates": {
    "default": "src/templates/page.html",
    "entries": {
      "default": "src/templates/page.html",
      "landing": "src/templates/custom/landing.html"
    }
  },
  "styles": {
    "defaultProfile": "default",
    "profiles": {
      "default": [
        "assets/css/main.css",
        "assets/css/components.css"
      ],
      "framework-full": [
        "assets/css/main.css",
        "assets/css/components.css",
        "assets/css/layout.css",
        "assets/css/themes.css"
      ],
      "academic-clean": [
        "assets/css/main.css",
        "assets/css/components.css",
        "assets/css/custom/academic-clean.css"
      ]
    }
  },
  "scripts": {
    "default": ["assets/js/custom/global.js"]
  }
}
```

## Template Contract

Any custom template should include these placeholders:

- `{{title}}`
- `{{siteTitle}}`
- `{{navigation}}`
- `{{breadcrumb}}`
- `{{content}}`
- `{{relatedPages}}`
- `{{stylesheets}}`
- `{{scripts}}`
- `{{bodyClass}}`

The default template is `src/templates/page.html`.

## Recommended Folder Conventions

- Framework styles: keep in `src/css/`
- Custom styles: add in `src/css/custom/`
- Framework templates: `src/templates/`
- Custom templates: `src/templates/custom/`

All files under `src/css/` and `src/js/custom/` are copied to `public/assets/` during build.
