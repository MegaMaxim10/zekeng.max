# Runtime And Scripts Guide

This framework separates core component runtime, template runtime behavior, and project customization runtime.

## Runtime Layers

Core component runtime:
- source: `scripts/core/runtime/runtime.js`
- copied to: `public/assets/core/js/runtime.js`
- loaded globally by the build for every page
- purpose: reusable component behaviors (content collections/carousels/lightbox, form validation/security, confirmation dialog)

Template runtime:
- declared in each template `template-config.json`
- source example: `templates/default/assets/js/runtime.js`
- copied to: `public/assets/templates/<template-name>/...`
- purpose: template-specific behavior only (theme/nav/layout for the default template)

Project custom runtime:
- source: `src/js/custom.js`
- copied to: `public/assets/js/custom.js`
- purpose: portfolio-specific behavior only

Optional custom scripts:
- any file under `src/js/`
- declare path in `portfolio-config.json` (`custom.scripts`) or page `presentation.extraScripts`
- if `custom.scripts` is omitted, the default global script is `assets/js/custom.js`

## Core Code Location

Build/render framework internals now live in:
- `scripts/core/components/` (block renderers)
- `scripts/core/block-processors.js` (async preprocessors)
- `scripts/core/utils/` (shared build-time utilities)

Build orchestration lives in:
- `scripts/builders/`

## Script Configuration

Global default custom scripts in `portfolio-config.json`:

```json
{
  "custom": {
    "scripts": ["assets/js/custom.js"]
  }
}
```

Per-page additional scripts:

```json
{
  "presentation": {
    "extraScripts": [
      { "src": "assets/js/academic.js", "module": true }
    ]
  }
}
```

## Best Practices

1. Put component-level reusable runtime in `scripts/core/runtime/`.
2. Keep template JS focused on template-specific behavior only.
3. Keep project-only behavior in `src/js/custom.js` and extra `src/js/*` files.
4. Avoid editing generated `public/` scripts directly.
