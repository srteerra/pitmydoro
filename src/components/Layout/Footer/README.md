# Footer

Site-wide footer rendered in `src/app/(general)/layout.tsx` below every page.

## Structure

- **Disclaimer** — F1 affiliation disclaimer (i18n key `footer.disclaimer`).
- **Made-with line** — credit to the author (`footer.madeWith`).
- **License link** — links to the GitHub repository with the GPL-3.0 label (`footer.license`).

## Theming

The background color is derived from the active scuderia's session background color (darkened 5%) in light mode and fixed to `gray.950` in dark mode, matching the page-level color scheme.

## i18n

All visible strings are translated via `next-intl`. Keys live under `footer` in `messages/en.json` and `messages/es.json`.
