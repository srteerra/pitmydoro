# Pomodoro

Root component that composes the full Pomodoro timer card.

## Responsibilities

- Renders the main card container that wraps all timer UI.
- Conditionally shows F1-themed elements (scuderia logo, car sprite animation, `FlagSwitcher`, `TimerSelector`) when `mode === PomodoroMode.F1`.
- Renders the `SegmentedControl` for switching between **Session**, **Short Break**, and **Long Break**.
- Mounts the `Counter` (countdown clock + controls) and the `Tasks` list.
- Derives the accent color for the segmented control from the current scuderia's background color using `tinycolor2`.

## Mode behaviour

| Mode      | Extras rendered                                                             |
| --------- | --------------------------------------------------------------------------- |
| `F1`      | Scuderia logo, car sprite, `FlagSwitcher`, `TimerSelector` (tire compounds) |
| `MINIMAL` | None — only the segment switcher, `Counter`, and `Tasks`                    |

## Key dependencies

| Import             | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `useSettingsStore` | `mode`, `currentScuderia`                  |
| `useSessionStore`  | `status`, `selectedTire`                   |
| `usePomodoroStore` | `isActive` (pauses sprite)                 |
| `usePomodoro`      | `changeCompoundTime`                       |
| `TimerSelector`    | Tire-compound picker (F1 mode only)        |
| `Counter`          | Countdown display and start/pause controls |
| `Tasks`            | Task list below the timer                  |
