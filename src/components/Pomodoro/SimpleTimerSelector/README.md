# SimpleTimerSelector

Inline, editable duration summary for Minimal mode.

## Responsibilities

- Displays a single sentence summarising the current session and break durations (e.g. _"Sesión de **25** mins, descanso corto de **5** mins y descanso largo de **15** mins."_).
- Each duration is rendered as a `DurationEditable` — an inline `Chakra Editable` field with a dashed underline that turns solid while editing.
- On blur / confirm, validates that the entered value is a positive number and persists it to the store.
  - Session duration → `useSettingsStore.setMinimalSessionDuration`
  - Short break → `useSettingsStore.updateBreakDuration(SHORT_BREAK, val)`
  - Long break → `useSettingsStore.updateBreakDuration(LONG_BREAK, val)`

## Internal component

### `DurationEditable`

| Prop       | Type                    | Description                                |
| ---------- | ----------------------- | ------------------------------------------ |
| `value`    | `number`                | Current duration in minutes                |
| `onChange` | `(val: number) => void` | Called with the new value after validation |
| `accent`   | `string`                | CSS colour for the underline indicator     |

## Usage context

Rendered inside `Pomodoro` when `mode === PomodoroMode.MINIMAL` in place of `TimerSelector`.
