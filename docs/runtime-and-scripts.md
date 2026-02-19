# Runtime And Scripts Guide

This framework separates reusable runtime behavior from project-specific behavior.

## Runtime Layers

Framework runtime:
- source: `src/js/framework/runtime.js`
- copied to: `public/assets/js/framework/runtime.js`
- purpose: theme toggle, navigation state, header offset sync, form validation/security, dialog

Custom runtime:
- source: `src/js/custom/global.js`
- copied to: `public/assets/js/custom/global.js`
- purpose: developer-specific scripts only

Related build-time content layer:
- `scripts/framework-config.js` (framework config merge/load)
- `scripts/content-resolver.js` (resolves `cfg`/`hook` tokens in content)

## Framework Runtime Modules

`src/js/framework/components/theme.js`
- theme initialization and toggle behavior

`src/js/framework/components/navigation.js`
- mobile nav expand/collapse
- active menu and breadcrumb link marking

`src/js/framework/components/layout.js`
- fixed header offset CSS variable sync
- optional decorative layout elements

`src/js/framework/components/forms.js`
- declarative form field validation and inline errors
- provider-specific form behavior (for example Formspree confirmation + anti-bot challenge)

`src/js/framework/components/dialog.js`
- reusable custom confirmation dialog

## Script Configuration

Configure default scripts in `framework.config.json`:

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

Script entry formats:
- string: `"assets/js/custom/global.js"` (classic script)
- object: `{ "src": "...", "module": true }`

Per-page additional scripts can be added with `presentation.extraScripts`.

## Best Practices

1. Keep shared behavior in `src/js/framework/components/`.
2. Keep project-only behavior in `src/js/custom/global.js`.
3. Avoid editing generated `public/` scripts directly.
4. If adding new framework runtime modules, import and initialize them in `src/js/framework/runtime.js`.
