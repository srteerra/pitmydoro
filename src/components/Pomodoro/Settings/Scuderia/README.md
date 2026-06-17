# Settings › Scuderia

F1 team (scuderia) selector that controls the app's color theme and car assets.

## Responsibilities

- Filters the global `SCUDERIAS` list by the selected season year.
- Renders year badges (`2025`, etc.) to switch between seasons.
- Displays each team as a `RadioCard` showing:
  - Team logo
  - Team name
  - Color swatches (`ColorPreview`)
  - Animated car sprite (`SpriteAnimation`)
- The selected card is highlighted using the team's `colors.background.session` color (darkened for the border, with a separate dark-mode treatment).
- On selection calls `useSettings.changeScuderia(id)` which persists the choice and updates the global store.

## Key dependencies

| Import             | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `SCUDERIAS`        | Static list of all teams with colors, logo, and sprite URLs |
| `useSettingsStore` | `currentScuderia` (initial selection)                       |
| `useSettings`      | `changeScuderia`                                            |
| `SpriteAnimation`  | Animated car preview                                        |
| `ColorPreview`     | Swatch row for a team's color palette                       |
| `tinycolor2`       | Computes checked-state border/background colors             |
