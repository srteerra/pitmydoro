import { expect, test } from '@playwright/test';
import {
  addStickyNote,
  clearStores,
  clickStickyTab,
  closeDrawer,
  isMobileLayout,
  readNotes,
  STICKY_NOTES_KEY,
} from './helpers';

test.describe('Sticky notes', () => {
  test.beforeEach(async ({ page }) => {
    await clearStores(page, [STICKY_NOTES_KEY]);
    await page.goto('/');
  });

  test('exposes the right entry point for the layout', async ({ page }) => {
    if (isMobileLayout(page)) {
      await expect(page.getByTestId('sticky-notes-fab')).toBeVisible();
      await expect(page.getByTestId('sticky-note-add')).toBeHidden();

      return;
    }

    await expect(page.getByTestId('sticky-notes-stack')).toBeVisible();
    await expect(page.getByTestId('sticky-note-add')).toBeVisible();
    await expect(page.getByTestId('sticky-notes-fab')).toBeHidden();
  });

  test('starts with no notes stored', async ({ page }) => {
    expect(await readNotes(page)).toHaveLength(0);
  });

  test('creates a note and opens its editor', async ({ page }) => {
    const editor = await addStickyNote(page);

    await expect(editor.getByTestId('sticky-note-label-input')).toHaveValue('New note');
    await expect(editor.getByTestId('sticky-note-content')).toHaveValue('');

    await expect.poll(async () => (await readNotes(page)).length).toBe(1);
  });

  test('persists the label and the content of a note', async ({ page }) => {
    const editor = await addStickyNote(page);

    await editor.getByTestId('sticky-note-label-input').fill('Race plan');
    await editor.getByTestId('sticky-note-content').fill('Box on lap 18');
    await editor.getByTestId('sticky-note-content').blur();

    await expect
      .poll(async () => {
        const [note] = await readNotes(page);

        return note && { label: note.label, content: note.content };
      })
      .toEqual({ label: 'Race plan', content: 'Box on lap 18' });
  });

  test('keeps the note after a reload', async ({ page }) => {
    const editor = await addStickyNote(page);

    await editor.getByTestId('sticky-note-label-input').fill('Persisted');
    await editor.getByTestId('sticky-note-content').fill('Still here');
    await editor.getByTestId('sticky-note-content').blur();

    await expect.poll(async () => (await readNotes(page))[0]?.content).toBe('Still here');

    await page.reload();

    const notes = await readNotes(page);
    expect(notes).toHaveLength(1);
    expect(notes[0].label).toBe('Persisted');
    expect(notes[0].content).toBe('Still here');
  });

  test('changes the colour of a note', async ({ page }) => {
    const editor = await addStickyNote(page);

    await expect.poll(async () => (await readNotes(page))[0]?.color).toBe('yellow');

    await editor.getByRole('button', { name: 'Use blue color' }).click();

    await expect.poll(async () => (await readNotes(page))[0]?.color).toBe('blue');
  });

  test('deletes a note from the editor', async ({ page }) => {
    const editor = await addStickyNote(page);

    await expect.poll(async () => (await readNotes(page)).length).toBe(1);

    await editor.getByTestId('sticky-note-delete').click();

    await expect.poll(async () => (await readNotes(page)).length).toBe(0);
    await expect(page.getByTestId('sticky-note-content')).toBeHidden();
  });

  test('creates several notes', async ({ page }) => {
    await addStickyNote(page);

    if (isMobileLayout(page)) await closeDrawer(page);

    await addStickyNote(page);

    await expect.poll(async () => (await readNotes(page)).length).toBe(2);
  });

  test('lists the stored notes on mobile', async ({ page }) => {
    test.skip(!isMobileLayout(page), 'mobile only entry point');

    const editor = await addStickyNote(page);
    await editor.getByTestId('sticky-note-label-input').fill('Setup ideas');
    await editor.getByTestId('sticky-note-label-input').blur();

    await expect.poll(async () => (await readNotes(page))[0]?.label).toBe('Setup ideas');

    await closeDrawer(page);
    await page.getByTestId('sticky-notes-fab').click();

    const list = page.getByTestId('sticky-notes-list');
    await expect(list).toBeVisible();
    await expect(list).toContainText('Setup ideas');
  });

  test('reopens a note from the mobile list', async ({ page }) => {
    test.skip(!isMobileLayout(page), 'mobile only entry point');

    const editor = await addStickyNote(page);
    await editor.getByTestId('sticky-note-content').fill('Reopen me');
    await editor.getByTestId('sticky-note-content').blur();

    await expect.poll(async () => (await readNotes(page))[0]?.content).toBe('Reopen me');

    await closeDrawer(page);
    await page.getByTestId('sticky-notes-fab').click();
    await expect(page.getByTestId('sticky-notes-list')).toBeVisible();

    const [note] = await readNotes(page);
    await page.getByTestId(`sticky-notes-list-item-${note.id}`).click();

    await expect(page.getByTestId('sticky-note-content')).toHaveValue('Reopen me');
  });

  test('shows a tab in the desktop stack and toggles its panel', async ({ page }) => {
    test.skip(isMobileLayout(page), 'desktop only stack');

    await addStickyNote(page);

    const [note] = await readNotes(page);
    const tab = page.getByTestId(`sticky-note-tab-${note.id}`);

    await expect(tab).toBeVisible();
    await expect(page.getByTestId('sticky-note-panel')).toBeVisible();

    await clickStickyTab(tab);
    await expect(page.getByTestId('sticky-note-panel')).toBeHidden();

    await clickStickyTab(tab);
    await expect(page.getByTestId('sticky-note-panel')).toBeVisible();
  });

  test('closes a desktop panel from its close button', async ({ page }) => {
    test.skip(isMobileLayout(page), 'desktop only panel');

    await addStickyNote(page);

    await page.getByTestId('sticky-note-panel-close').click();

    await expect(page.getByTestId('sticky-note-panel')).toBeHidden();
    expect(await readNotes(page)).toHaveLength(1);
  });

  test('renames the desktop tab when the label changes', async ({ page }) => {
    test.skip(isMobileLayout(page), 'desktop only stack');

    const panel = await addStickyNote(page);

    await panel.getByTestId('sticky-note-label-input').fill('Strategy');
    await panel.getByTestId('sticky-note-label-input').blur();

    const [note] = await readNotes(page);

    await expect(page.getByTestId(`sticky-note-tab-${note.id}`)).toContainText('Strategy');
  });
});
