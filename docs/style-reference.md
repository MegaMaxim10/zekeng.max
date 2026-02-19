# Style Reference

This file documents stable class hooks developers can target from custom CSS.

## Page-Level Structure

- `.site-header`
- `.breadcrumb`
- `.main`
- `.content`
- `.related-pages`
- `.site-footer`

## Header And Navigation

- `.nav-container`
- `.site-brand`
- `.site-nav`
- `.menu-root`
- `.menu-item`
- `.menu-link`
- `.submenu`
- `.submenu-link`
- `.nav-toggle`
- `.theme-toggle`

## Common Block Wrappers

All blocks include a wrapper class with the `block-` prefix when applicable:

- `.block-paragraph`
- `.block-list`
- `.block-card-grid`
- `.block-timeline`
- `.block-form`
- `.block-asset`
- `.block-html-content`

Use block `style` arrays in JSON to append project-specific classes.

## ORCID Block

- `.orcid-profile`
- `.orcid-section`
- `.orcid-works`
- `.orcid-work`
- `.orcid-peer-reviews`
- `.peer-review`

## Cards, Timeline, Forms

- `.card-grid`, `.card`
- `.timeline`, `.timeline-item`, `.timeline-content`, `.timeline-period`
- `.contact-form`

## Extension Rule

Prefer adding custom classes via page/block JSON and targeting them in `src/css/custom/*.css` instead of overriding framework classes directly.
