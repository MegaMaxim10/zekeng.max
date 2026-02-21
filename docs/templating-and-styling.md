# Templating And Styling Guide

This guide explains how templates and customization assets are resolved at build time.

## 1. Separation Model

Template-owned:
- `templates/<qualified-template-name>/`
- each folder includes `template-config.json`
- template html/css/js are declared in that manifest

Template naming:
- Use URL-safe names: lowercase letters, numbers, and `-` only.
- Recommended pattern: `^[a-z0-9-]+$`.

Developer-owned:
- `portfolio-config.json` (global selection and custom assets)
- `src/css/custom.css` (fixed custom stylesheet entry)
- `src/js/custom.js` (fixed custom script entry)
- optional extra files under `src/css/` and `src/js/`
- page-level `presentation` overrides in content JSON

## 2. Build-Time Resolution

In `scripts/builders/build.js`, for each page:
1. Resolve template name from `presentation.template` or `templates.default`.
2. Load `templates/<templateName>/template-config.json`.
3. Resolve html from `template-config.json -> html`.
4. Add built-in core runtime script (`assets/core/js/runtime.js`).
5. Resolve template styles/scripts from the same manifest.
6. Merge global custom assets from `portfolio-config.json -> custom`.
7. Merge page-level `presentation.extraStyles` and `presentation.extraScripts`.
8. Inject placeholders into the selected template html.

Template placeholders expected by the default contract:
- `{{title}}`
- `{{siteTitle}}`
- `{{faviconHref}}`
- `{{logoSrc}}`
- `{{logoAlt}}`
- `{{navigation}}`
- `{{breadcrumb}}`
- `{{content}}`
- `{{relatedPages}}`
- `{{stylesheets}}`
- `{{scripts}}`
- `{{bodyClass}}`
- `{{headMeta}}`

## 3. Global Config (`portfolio-config.json`)

```json
{
  "site": {
    "branding": {
      "favicon": "assets/icons/favicon.svg",
      "logo": {
        "src": "assets/images/logo.svg",
        "alt": "Site logo"
      }
    }
  },
  "templates": {
    "default": "default"
  }
}
```

`custom.styles` and `custom.scripts` are optional. If omitted, defaults are:
- `assets/css/custom.css`
- `assets/js/custom.js`

## 4. Template Manifest (`template-config.json`)

Example `templates/default/template-config.json`:

```json
{
  "name": "default",
  "html": "page.html",
  "styles": [
    "assets/css/main.css",
    "assets/css/components.css"
  ],
  "scripts": [
    { "src": "assets/js/runtime.js", "module": true }
  ]
}
```

Paths are relative to the template folder.
Core runtime scripts do not need to be declared in template manifests; they are injected globally by the build.

## 5. Per-Page Presentation

Inside any page JSON:

```json
{
  "presentation": {
    "template": "default",
    "bodyClass": "profile-academic",
    "extraStyles": ["assets/css/academic.css"],
    "extraScripts": [
      { "src": "assets/js/academic.js", "module": true }
    ]
  }
}
```

## 6. Recommended Workflow

1. Add/update templates under `templates/`.
2. Select global default in `portfolio-config.json`.
3. Keep project customization in `src/css` and `src/js`.
4. Use per-page `presentation` overrides only when needed.
5. Run `npm run verify`.
