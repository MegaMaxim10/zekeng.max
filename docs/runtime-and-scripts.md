# Runtime And Scripts Guide

This framework separates template runtime behavior from project customization runtime.

## Runtime Layers

Template runtime:
- declared in each template `template-config.json`
- source example: `templates/default/assets/js/runtime.js`
- copied to: `public/assets/templates/<template-name>/...`
- purpose: template-specific shared behavior (theme/nav/layout/forms/dialog)

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

1. Keep template-level reusable behavior inside template folders.
2. Keep project-only behavior in `src/js/custom.js` and extra `src/js/*` files.
3. Avoid editing generated `public/` scripts directly.
