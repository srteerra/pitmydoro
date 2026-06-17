# Settings › General

General settings tab composed from focused sub-sections.

## Responsibilities

- Calls `useSettings()` to sync settings to the store on mount.
- Reads the current `mode` from `useSettingsStore` and conditionally includes the **Timers** section (F1 mode only).
- Renders each section in order, separated by `<Separator>` dividers:

| Section            | Component       | Description                                    |
| ------------------ | --------------- | ---------------------------------------------- |
| Timers _(F1 only)_ | `Timers`        | Per-tire compound session durations            |
| Session            | `Session`       | Long-break interval and auto-advance behaviour |
| Tasks              | `Tasks`         | Task-related preferences                       |
| Sounds             | `Sounds`        | Sound effect toggles and volume                |
| Notifications      | `Notifications` | Desktop notification permission                |
| Language           | `Locale`        | UI locale selector                             |

## Key dependencies

| Import             | Purpose                      |
| ------------------ | ---------------------------- |
| `useSettingsStore` | `mode`                       |
| `useSettings`      | Bootstraps/persists settings |
