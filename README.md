# Maxime Zekeng's Online Portfolio

A modern, schema-driven static site generator tailored for academic and professional portfolios. This framework transforms structured JSON content into a fully built, optimized HTML/CSS/JS website with zero runtime dependencies.

## Philosophy

This project is built on three core principles:

1. **Content-First Design**: Separate content from presentation. Define your portfolio through JSON schemas, ensuring data consistency and enabling automatic validation before build time.

2. **Static Generation**: No servers, no databases, no complexity. The entire site is built at development time into pure static HTML/CSS/JS, making it fast, secure, and deployable anywhere.

3. **Modular & Composable**: Each section of your portfolio (news, teaching, research, consulting) is built from reusable content blocks — paragraphs, timelines, card grids, forms — that combine to create rich pages.

## Quick Start

### Prerequisites
- Node.js 16+
- npm

### Installation

```bash
npm install
```

### Development & Building

```bash
# Build the static site
npm run build

# Validate your content before building
npm run validate:content

# Run tests
npm test

# Watch mode for tests
npm run test:watch

# Full pipeline: validate → test → build
npm run validate-test-and-build
```

The generated site will be in the `public/` directory. Open `public/index.html` in a browser to view.

## Architecture

### Content Pipeline

The framework follows a clearly defined pipeline:

```
JSON Content Files
    ↓
Schema Validation (AJV)
    ↓
Site Graph Analysis (directory structure)
    ↓
Render Content Blocks (per-type renderers)
    ↓
Apply Master Template (layout + navigation)
    ↓
Write HTML Output
    ↓
Minify Assets (HTML, CSS, JavaScript)
    ↓
Static HTML in public/
```

### Project Structure

```
zekeng-maxime-online/
├── content/                    # Content files (JSON-based), to be adapted on purpose
│   ├── index.json             # Homepage
│   ├── 1-news/                # News & blog section
│   ├── 2-teaching/            # Teaching activities
│   ├── 3-research/            # Research interests & publications
│   ├── 4-consulting/          # Consulting services
│   ├── 5-other-activities/    # Additional activities
│   ├── 6-contact/             # Contact information
│   └── carroussel.html        # Embedded HTML (for carousel)
│
├── src/                        # Source code
│   ├── js/
│   │   ├── components/        # Block type renderers
│   │   │   ├── paragraph.js
│   │   │   ├── heading.js
│   │   │   ├── list.js
│   │   │   ├── timeline.js
│   │   │   ├── card-grid.js
│   │   │   ├── form.js
│   │   │   ├── asset.js
│   │   │   ├── link.js
│   │   │   ├── html-content.js
│   │   │   └── ...
│   │   ├── custom/            # Custom client-side JavaScript
│   │   ├── utils/             # Utilities (escapeHtml, rendering)
│   │   └── renderer.js        # Core orchestrator
│   │
│   ├── css/
│   │   ├── main.css           # Main stylesheet
│   │   ├── components.css     # Component-specific styles
│   │   ├── layout.css         # Layout & grid system
│   │   └── themes.css         # Light/dark theme CSS variables
│   │
│   └── templates/
│       └── page.html          # Master HTML template
│
├── scripts/                    # Build pipeline
│   ├── build.js               # Main build orchestrator
│   ├── validate-content.js    # JSON schema validation
│   ├── navigation.js          # Navigation & breadcrumb generation
│   ├── site-graph.js          # Analyze directory structure
│   ├── minify.js              # Asset minification
│   └── assets.js              # Copy static assets
│
├── schemas/
│   └── page.schema.json       # JSON Schema for content validation
│
├── tests/                      # Test suite (Vitest)
│   ├── renderer/              # Component rendering tests
│   ├── scripts/               # Build script tests
│   └── fixtures/              # Test data
│
├── public/                     # Generated output (gitignored)
├── assets/                     # Static assets (images, documents)
├── package.json
└── README.md
```

## Content Creation

### Basic Structure

Each page is a JSON file with three main sections:

```json
{
  "meta": {
    "id": "page-id",
    "title": "Page Title",
    "language": "en"
  },
  "header": {
    "title": "Display Title",
    "lead": "Optional introduction text"
  },
  "body": [
    { "type": "paragraph", "data": { "text": "Your content here..." } }
  ]
}
```

### Supported Content Block Types

| Block Type | Purpose | Example |
|-----------|---------|---------|
| **paragraph** | Text content with automatic HTML escaping | `{ "type": "paragraph", "data": { "text": "..." } }` |
| **heading** | Section headings (h1-h6) | `{ "type": "heading", "data": { "level": 2, "text": "Research" } }` |
| **list** | Bullet points | `{ "type": "list", "data": { "items": ["Item 1", "Item 2"] } }` |
| **timeline** | Chronological events | `{ "type": "timeline", "data": { "items": [{ "period": "2020-2022", "title": "...", "description": "..." }] } }` |
| **card-grid** | Visual grid of cards | `{ "type": "card-grid", "data": { "cards": [{"title": "...", "description": "...", "image": "path", "link": "url"}] } }` |
| **link** | External or internal links | `{ "type": "link", "data": { "label": "Visit", "url": "https://...", "external": true } }` |
| **asset** | File downloads (PDF, ZIP, images) | `{ "type": "asset", "data": { "kind": "pdf", "src": "file.pdf", "label": "Download" } }` |
| **form** | Contact or submission forms | `{ "type": "form", "data": { "provider": "formspree", "endpoint": "...", "fields": [...] } }` |
| **html-content** | Embed custom HTML files | `{ "type": "html-content", "data": { "url": "path/to/file.html" } }` |

### Optional Block Properties

All blocks support:
- `id`: Unique identifier (used as anchor)
- `style`: Array of CSS class names for custom styling

### Example Page

```json
{
  "meta": {
    "id": "research",
    "title": "Research",
    "language": "en"
  },
  "header": {
    "title": "My Research",
    "lead": "Exploring innovative solutions in my field"
  },
  "body": [
    {
      "type": "heading",
      "data": { "level": 2, "text": "Research Interests" }
    },
    {
      "type": "list",
      "data": {
        "items": [
          "Interest 1",
          "Interest 2",
          "Interest 3"
        ]
      }
    },
    {
      "type": "timeline",
      "data": {
        "items": [
          {
            "period": "2020-2022",
            "title": "Project Alpha",
            "description": "Developed novel approaches..."
          },
          {
            "period": "2022-Present",
            "title": "Project Beta",
            "description": "Current research focus..."
          }
        ]
      }
    },
    {
      "type": "paragraph",
      "data": {
        "text": "Additional context and details about the research..."
      }
    }
  ],
  "footer": {
    "text": "For more information, please contact me."
  }
}
```

### Directory Organization

Organize your content by section:

```
content/
├── index.json                 # Homepage (required)
├── 1-news/
│   └── index.json            # News section main page
├── 2-teaching/
│   ├── index.json
│   ├── courses.json
│   └── supervision.json
├── 3-research/
│   ├── index.json
│   ├── publications.json
│   └── projects.json
└── ... (more sections)
```

Directories with numeric prefixes (1-, 2-, 3-, etc.) appear in order in navigation. The first page listed alphabetically becomes the main section page.

## Features

### Automatic Navigation

- **Main Menu**: Generated from directory structure
- **Breadcrumbs**: Shows your position in the hierarchy
- **Related Pages**: Lists other pages in the same section
- Navigation is built automatically at compile time — no configuration needed

### Schema Validation

All content is validated against `schemas/page.schema.json` before building:

```bash
npm run validate:content
```

This ensures:
- Required fields are present
- Block types are recognized
- URLs follow URI format
- Catches errors before the site builds

### Responsive Design

- Mobile-first responsive layout
- Hamburger menu for mobile navigation
- Touch-friendly interface

### Theme Support

- Light/dark theme toggle (CSS variables)
- Users' preference is remembered
- Themes defined in `src/css/themes.css`

### Security

- HTML escaping in all content blocks (XSS protection)
- No server-side code execution
- Safe third-party embeds (forms, assets)

## Testing

The project includes comprehensive tests:

```bash
# Run all tests once
npm test

# Watch mode (re-run when files change)
npm run test:watch
```

Tests cover:
- Component rendering (snapshot tests)
- Build scripts (unit tests)
- Site graph analysis
- Navigation generation
- HTML escaping security

Test files are in `tests/` organized by module:
- `tests/renderer/` - Component rendering
- `tests/scripts/` - Build pipeline scripts
- `tests/fixtures/` - Sample data for tests

## Deployment

### Build for Production

```bash
npm run build
```

This creates the `public/` directory with:
- Complete HTML/CSS/JS website
- All assets minified
- Ready to deploy

### Deploying to Different Hosts

If deploying to a subdirectory (not root), set the `BASE_PATH` environment variable:

```bash
BASE_PATH=/portfolio npm run build
```

This adjusts all links and asset paths automatically.

### Hosting Options

The static output can be deployed to:
- **GitHub Pages**: Push `public/` to gh-pages branch
- **Netlify**: Connect your repo and build with `npm run build`
- **Vercel**: Zero configuration, auto-builds on push
- **Any static host**: AWS S3, CloudFront, nginx, etc.

## Development

### Adding a New Content Page

1. Create a JSON file in `content/section/page.json`
2. Follow the schema: `meta`, `header` (optional), `body`, `footer` (optional)
3. Use supported block types in `body`
4. Run `npm run validate:content` to check for errors
5. Run `npm run build` to generate HTML

### Styling

- Main stylesheet: `src/css/main.css`
- Component styles: `src/css/components.css`
- Layout: `src/css/layout.css`
- Themes: `src/css/themes.css`

To apply custom classes to blocks, add the `style` property:

```json
{ "type": "paragraph", "data": { "text": "..." }, "style": ["custom-class"] }
```

### Custom JavaScript

Place client-side scripts in `src/js/custom/` and they'll be included in the build and minified.

### Adding a New Block Type

1. Create `src/js/components/myblock.js` with a `renderMyblock()` function
2. Import in `src/js/renderer.js`
3. Add to the renderer's type dispatch
4. Update `schemas/page.schema.json` to include the new type
5. Add tests in `tests/renderer/`

## Build Process Details

When you run `npm run build`:

1. **Validate**: All JSON content is validated against the schema
2. **Analyze**: Directory structure is analyzed to build navigation
3. **Render**: Each JSON file is converted to HTML using its block types
4. **Template**: Content is wrapped with the master template
5. **Navigate**: Main menu, breadcrumbs, and related pages are added
6. **Assets**: Static files (images, documents) are copied
7. **Minify**: All HTML, CSS, and JavaScript are minified for production
8. **Output**: Complete website written to `public/`

## Performance Considerations

- **Static generation**: No runtime overhead, pure HTTP serving
- **Minification**: ~60-70% reduction in CSS/JS size
- **No JavaScript dependencies**: Framework uses vanilla JavaScript (only offline build dependencies)
- **Fast builds**: Entire site builds in seconds
- **Cache-friendly**: Static assets can use aggressive caching headers

## Dependencies

The framework uses only essential, production-proven packages:

- **ajv**: JSON schema validation (offline)
- **glob**: File pattern matching (build-time)
- **clean-css**: CSS minification
- **html-minifier-terser**: HTML minification
- **terser**: JavaScript minification
- **vitest**: Testing framework (dev-only)

## License

MIT

## Author

Zekeng Ndadji Milliam Maxime - [ndadjimaxime@yahoo.fr](mailto:ndadjimaxime@yahoo.fr)