# Tasks

Task list panel rendered below the Pomodoro timer.

## Responsibilities

- Displays the list of active (non-archived) tasks sorted by their `order` field.
- Wraps tasks in `SortableList` to support drag-and-drop reordering; persists new order via `useTasks.handleReorderTasks`.
- Renders each task as a `TaskCard`.
- Handles task selection: clicking a card calls `usePomodoro.switchTask(task)`, setting it as the active Pomodoro task. Prevents switching while a task is being edited.
- Provides an _Add task_ button (`ZoneButton`) that calls `useTasks.handleAddTask()` and immediately puts the new card into edit mode.
- Shows a loading state while tasks are being fetched.

## Key dependencies

| Import         | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `useTaskStore` | `tasks`, `editingTask`, `setEditingTask`         |
| `useTasks`     | `loading`, `handleAddTask`, `handleReorderTasks` |
| `usePomodoro`  | `switchTask`                                     |
| `SortableList` | Drag-and-drop container                          |
| `TaskCard`     | Individual task row                              |
