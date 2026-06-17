# TaskCard

Individual task row with inline editing and a contextual action menu.

## Responsibilities

### View mode

- Shows task order, title, description, and Pomodoro counter (`completed / estimated`).
- Highlights the active task with a coloured left border; completed tasks show a strikethrough and a grey border.
- Opens the context menu (`HiDotsVertical` button) with the following actions:
  - **Stats** — opens the `StatsDialog` in a drawer (requires authenticated user; shows a lock icon otherwise).
  - **Edit** — switches the card to edit mode.
  - **Mark as completed / uncompleted** — toggles `task.completedAt`.
  - **Archive** — deletes the task after a confirm alert.

### Edit mode

- Exposes an `Input` for the title, a `Textarea` for the description, and two `NumberInput` spinners for completed / estimated Pomodoros.
- **Save** (green check) — persists changes via `useTasks.handleEditTask` and shows a success toast.
- **Cancel** (red X) — reverts local state; deletes the task if it has no title yet (newly created).

## Props

| Prop            | Type                              | Description                                  |
| --------------- | --------------------------------- | -------------------------------------------- |
| `task`          | `Task`                            | The task data to display                     |
| `draggableIcon` | `ReactNode` (optional)            | Drag handle injected by `SortableList`       |
| `onTaskClick`   | `(task: Task) => void` (optional) | Called when the card is clicked in view mode |

## Key dependencies

| Import          | Purpose                                     |
| --------------- | ------------------------------------------- |
| `useTaskStore`  | `editingTask`, `currentTask`                |
| `useTasks`      | `deleteTask`, `checkTask`, `handleEditTask` |
| `useUserStore`  | `profile` (gates stats access)              |
| `DrawerContext` | Opens stats drawer                          |
| `StatsDialog`   | Per-task Pomodoro statistics                |
