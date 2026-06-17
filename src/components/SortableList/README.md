# SortableList

Generic drag-and-drop sortable list built on `@dnd-kit`.

## Responsibilities

- Wraps items in a `DndContext` with `PointerSensor` (mouse/touch) and `KeyboardSensor` (accessibility) support.
- On `dragEnd`, computes the new order with `arrayMove` and calls `onChange(newItems)`.
- Renders a `SortableOverlay` (floating drag preview) that mirrors the active item's rendered output while dragging.
- Exposes `SortableList.Item` and `SortableList.DragHandle` as static members for use in `renderItem`.

## Props

| Prop         | Type                                    | Description                                  |
| ------------ | --------------------------------------- | -------------------------------------------- |
| `items`      | `T[]` (requires `id: UniqueIdentifier`) | The ordered list of items                    |
| `onChange`   | `(items: T[]) => void`                  | Called with the reordered array after a drop |
| `renderItem` | `(item: T) => ReactNode`                | Render function for each item                |

## Usage

```tsx
<SortableList
  items={sortedTasks}
  onChange={handleReorderTasks}
  renderItem={(task) => (
    <SortableList.Item id={task.id}>
      <TaskCard task={task} draggableIcon={<SortableList.DragHandle />} />
    </SortableList.Item>
  )}
/>
```

## Exported members

| Export                    | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `SortableList`            | Main list component                             |
| `SortableList.Item`       | Sortable wrapper for each item (`SortableItem`) |
| `SortableList.DragHandle` | Drag-grip icon that initiates a drag            |
