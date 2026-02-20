# Core Modules

Core rendering and preprocessing logic is isolated here.

- `components/`: one renderer per block type (`paragraph`, `form`, `map`, `orcid`, ...)
- `renderer.js`: dispatches block rendering
- `block-processors.js`: async preprocessors (for example ORCID enrichment)
- `utils/`: shared helper utilities used by core modules

Build orchestration imports from this folder, while developer customization stays in `src/`.
