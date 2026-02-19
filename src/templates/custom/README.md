# Custom Templates

Put project-specific page templates here.

Register template entries in `framework.config.json`:

```json
{
  "templates": {
    "entries": {
      "landing": "src/templates/custom/landing.html"
    }
  }
}
```

Then select it declaratively in page JSON:

```json
{
  "presentation": {
    "template": "landing"
  }
}
```
