# Templating And Styling Guide

This guide explains how templates, styles, and scripts are resolved at build time.

## 1. Separation Model

Framework-owned:
- `src/templates/page.html` (default template contract)
- `src/css/main.css`, `src/css/components.css` (framework baseline)
- `src/js/framework/` (framework runtime behavior)

Developer-owned:
- `framework.config.json` (configuration surface)
- `src/templates/custom/` (custom templates)
- `src/css/custom/` (custom style layers)
- `src/js/custom/global.js` (project-specific client logic)
- page-level `presentation` overrides in content JSON

## 2. Build-Time Resolution

In `scripts/build.js`, for each page:
1. Resolve template from `presentation.template` or `templates.default`.
2. Resolve style profile from `presentation.styleProfile` or `styles.defaultProfile`.
3. Merge profile styles + `presentation.extraStyles`.
4. Merge default scripts + `presentation.extraScripts`.
5. Resolve content tokens (`cfg` / `hook`) in page JSON.
6. Inject placeholders into the selected template.

Template placeholders expected by default contract:
- `{{title}}`
- `{{siteTitle}}`
- `{{navigation}}`
- `{{breadcrumb}}`
- `{{content}}`
- `{{relatedPages}}`
- `{{stylesheets}}`
- `{{scripts}}`
- `{{bodyClass}}`
- `{{headMeta}}`

## 3. `framework.config.json` Template And Style Configuration

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
      ]
    }
  }
}
```

## 4. Script Entries

`scripts.default` and `presentation.extraScripts` accept:
- string path (classic script)
- object `{ "src": "...", "module": true|false }`

Example:

```json
{
  "scripts": {
    "default": [
      { "src": "assets/js/framework/runtime.js", "module": true },
      "assets/js/custom/global.js"
    ]
  }
}
```

## 5. Per-Page Presentation

Inside any page JSON:

```json
{
  "presentation": {
    "template": "default",
    "styleProfile": "framework-full",
    "bodyClass": "profile-academic",
    "extraStyles": ["assets/css/custom/academic.css"],
    "extraScripts": [
      { "src": "assets/js/custom/academic.js", "module": true }
    ]
  }
}
```

## 6. Recommended Workflow

1. Keep framework files generic.
2. Add project-specific CSS in `src/css/custom/`.
3. Add project-specific JS in `src/js/custom/global.js` or extra scripts.
4. Use `presentation` per page when layout or assets differ.
5. Run `npm run validate-test-and-build`.

## 7. Content References

Page JSON can reference config-derived values:

- `{{cfg:...}}` for direct config access
- `{{hook:...}}` for computed values

See `docs/content-references.md` for syntax and hook list.
