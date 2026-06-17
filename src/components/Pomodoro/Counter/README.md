# Counter

Countdown clock with start / pause / reset controls and session lifecycle management.

## Responsibilities

- Displays a live `MM:SS` countdown powered by `react-countdown`.
- **Start** — calls `usePomodoro.start()` or `resume()` depending on whether a pomodoro is already in progress, and plays the start sound.
- **Pause** — pauses the clock and calls `usePomodoro.pause()`.
- **Reset menu** — two options:
  - _Reset timer_ — resets only the clock for the current session.
  - _Reset all_ — resets the clock and all tasks, with a 5-second undo toast.
- **Settings button** — opens the `Settings` dialog via `DialogContext`.
- Handles interval completion: when the countdown reaches zero it auto-advances the clock to the next session/break duration and calls `usePomodoro.complete()`.
- Updates `document.title` on each tick with the remaining time and session label.
- Triggers a radio sound, browser notification, and device vibration when ≤ 4 seconds remain.
- Displays the running Pomodoro count (`completed / total`) and estimated finish time below the clock.

## Color theming

Button and counter colors are computed from the current scuderia's palette using `tinycolor2`, with separate light/dark-mode paths driven by `next-themes`.

## Key dependencies

| Import             | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `usePomodoro`      | `start`, `pause`, `resume`, `complete`, `reset`, pomodoro counts    |
| `usePomodoroStore` | `isActive`, `isEndingSoon`, `estTimeFinish`                         |
| `useSessionStore`  | `status`, `selectedTire`, `dateClock`                               |
| `useSettingsStore` | `tiresSettings`, `breaksDuration`, `mode`, `minimalSessionDuration` |
| `useSounds`        | `playSound`, `resumeSound`, `radioSound`                            |
| `useTasks`         | `resetAllTasks`, `undoResetAllTasks`                                |
| `DialogContext`    | Opens the `Settings` panel                                          |
| `react-countdown`  | Countdown engine                                                    |
