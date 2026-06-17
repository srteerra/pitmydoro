# Settings

Settings panel opened from the `Counter`'s gear icon.

## Responsibilities

- Provides a two-pane layout: a sidebar/tab navigation on the left and a scrollable content panel on the right.
- On **desktop** the nav renders as a vertical list of `NavItem` links with an active highlight.
- On **mobile** it collapses to a `Tabs` component for horizontal navigation.
- Manages the active tab in local state and renders the corresponding sub-panel:
  - `Tab.GENERAL` → `<General />`
  - `Tab.SCUDERIA` → `<Scuderia />`
  - `Tab.SUPPORT` → `<Support />` (currently hidden)

## Tabs

| Tab      | Component  | Description                                                             |
| -------- | ---------- | ----------------------------------------------------------------------- |
| General  | `General`  | Timer durations, session config, tasks, sounds, notifications, language |
| Scuderia | `Scuderia` | F1 team / color theme selector                                          |

## Usage context

Rendered inside a `Dialog` triggered by the `Counter` component via `DialogContext.openDialog`.
