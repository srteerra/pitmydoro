# TimerSelector

F1 tire-compound picker that maps each compound to a session duration.

## Responsibilities

- Renders a horizontally scrolling strip of tire icons (Soft, Medium, Hard, Intermediate, Wet) rendered from a sprite sheet (`/public/images/tires.webp`).
- Keeps the selected tire centred; non-selected tires slide into view with a CSS `translateX` transition and fade to 50% opacity.
- The strip is edge-masked with a `linear-gradient` so items fade out toward the left and right.
- Calls `onSelect(tire)` when a compound is clicked, propagating the change up to `Pomodoro` → `usePomodoro.changeCompoundTime`.

## Props

| Prop       | Type                           | Description                                                  |
| ---------- | ------------------------------ | ------------------------------------------------------------ |
| `value`    | `TireTypeEnum` (optional)      | Currently selected tire; defaults to the centre index (Hard) |
| `onSelect` | `(tire: TireTypeEnum) => void` | Callback fired on selection                                  |

## Constants

| Constant        | Value | Meaning                            |
| --------------- | ----- | ---------------------------------- |
| `TOTAL_ICONS`   | 7     | Total frames in the sprite sheet   |
| `ICON_SIZE`     | 55 px | Width & height of each tire icon   |
| `VISIBLE_TIRES` | 5     | How many icons are visible at once |

## Usage context

Only rendered in `Pomodoro` when `mode === PomodoroMode.F1`.
