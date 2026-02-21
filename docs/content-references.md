# Content References (`cfg` And `hook`)

This framework supports configuration-driven content in page JSON files.

You can embed tokens in string fields and they are resolved before validation/rendering.

## Token Types

## `cfg`

Read a value from merged framework config (`portfolio-config.json` + defaults).

Syntax:

```text
{{cfg:path.to.value}}
```

Examples:

```text
{{cfg:site.contact.fullName}}
{{cfg:site.contact.emails.institutional}}
{{cfg:site.contact.coordinates.latitude}}
```

## `hook`

Call a predefined helper to compute derived values.

Syntax:

```text
{{hook:hookName(arg1,arg2,...)}}
```

Examples:

```text
{{hook:contact.phoneDisplay(0)}}
{{hook:contact.phoneTelUrl(0)}}
{{hook:contact.whatsappUrl(0)}}
{{hook:contact.emailMailto(institutional)}}
{{hook:contact.socialUrl(github)}}
```

## Current Built-In Hooks

- `contact.phoneDisplay(index)`
- `contact.phoneTelUrl(index)`
- `contact.whatsappUrl(index)`
- `contact.emailMailto(kind,index)`
- `contact.socialUrl(key)`
- `contact.socialLabel(key)`
- `contact.profileLine()`
- `contact.officeLine()`

Implementation location:
- `scripts/builders/content-resolver.js`

Note: component-specific derivations are handled inside components (for example map URL generation in `scripts/core/components/map.js`), not as global hooks.

## Resolution Rules

1. Resolver walks every JSON value recursively.
2. Non-token strings are unchanged.
3. If a field is only a token, native type is preserved when possible (number/object/etc).
4. If a string mixes text and tokens, resolved values are interpolated as text.

## Where Resolution Happens

- Validation: `scripts/builders/validate-content.js`
- Build: `scripts/builders/build.js`

Both use:
- `scripts/builders/portfolio-config.js` (config loading/merge)
- `scripts/builders/content-resolver.js` (token resolution)

## Authoring Example

```json
{
  "header": {
    "subtitle": "{{cfg:site.contact.fullName}}",
    "lead": "{{cfg:site.contact.role}} at {{cfg:site.contact.institution}}."
  },
  "body": [
    {
      "type": "link",
      "data": {
        "label": "Call",
        "url": "{{hook:contact.phoneTelUrl(0)}}",
        "external": true
      }
    }
  ]
}
```

