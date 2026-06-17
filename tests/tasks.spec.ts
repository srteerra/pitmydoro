import { expect, test } from '@playwright/test';

const STORE_KEY = 'pitmydoro_tasks';

test.describe('Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => localStorage.removeItem(key), STORE_KEY);
    await page.goto('/');
  });

  async function addTask(page: any, title: string, description?: string) {
    await page.getByTestId('addTask-button').click();
    await page.getByTestId('task-title-input').fill(title);
    if (description) {
      await page.getByTestId('task-description-input').fill(description);
    }
    await page.getByTestId('task-save-button').click();
    await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
  }

  async function openTaskMenu(page: any, index = 0) {
    await page.getByTestId('task-menu-trigger').nth(index).click();
    await page.getByTestId('task-menu-edit').first().waitFor({ state: 'visible' });
  }

  async function clickMenuItem(page: any, testId: string) {
    await page.getByTestId(testId).click({ force: true });
  }

  test.describe('initial state', () => {
    test('should display the add task button', async ({ page }) => {
      await expect(page.getByTestId('addTask-button')).toBeVisible();
    });

    test('should show no tasks on a clean slate', async ({ page }) => {
      await expect(page.getByTestId('task-card')).toHaveCount(0);
    });
  });

  test.describe('creation', () => {
    test('should open the inline editor when clicking add task', async ({ page }) => {
      await page.getByTestId('addTask-button').click();
      await expect(page.getByTestId('task-title-input')).toBeVisible();
      await expect(page.getByTestId('task-title-input')).toBeFocused();
    });

    test('should disable the save button when title is empty', async ({ page }) => {
      await page.getByTestId('addTask-button').click();
      await expect(page.getByTestId('task-save-button')).toBeDisabled();
    });

    test('should create a task with only a title', async ({ page }) => {
      await addTask(page, 'My first task');
      await expect(page.getByTestId('task-card')).toHaveCount(1);
    });

    test('should create a task with a title and description', async ({ page }) => {
      await addTask(page, 'Task with desc', 'Some description');
      const card = page.getByTestId('task-card').first();
      await expect(card).toContainText('Task with desc');
      await expect(card).toContainText('Some description');
    });

    test('should discard an empty task when cancelling', async ({ page }) => {
      await page.getByTestId('addTask-button').click();
      await expect(page.getByTestId('task-title-input')).toBeVisible();
      await page.getByTestId('task-cancel-button').click();
      await expect(page.getByTestId('task-card')).toHaveCount(0);
    });

    test('should create multiple tasks sequentially', async ({ page }) => {
      await addTask(page, 'Task Alpha');
      await addTask(page, 'Task Beta');
      await addTask(page, 'Task Gamma');
      await expect(page.getByTestId('task-card')).toHaveCount(3);
    });

    test('should show the order number on a new task', async ({ page }) => {
      await addTask(page, 'Ordered task');
      await expect(page.getByTestId('task-card').first()).toContainText('#1');
    });

    test('should insert each new task at the top of the list', async ({ page }) => {
      await addTask(page, 'First');
      await addTask(page, 'Second');
      await addTask(page, 'Third');

      const cards = page.getByTestId('task-card');
      await expect(cards.nth(0)).toContainText('Third');
      await expect(cards.nth(1)).toContainText('Second');
      await expect(cards.nth(2)).toContainText('First');
    });

    test('should show the drag handle on a new task', async ({ page }) => {
      await addTask(page, 'Draggable task');
      await expect(page.getByTestId('task-drag-handle').first()).toBeVisible();
    });
  });

  test.describe('editing', () => {
    test.beforeEach(async ({ page }) => {
      await addTask(page, 'Original Title', 'Original description');
    });

    test('should open the inline editor via the menu', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-edit');
      await expect(page.getByTestId('task-title-input')).toBeVisible();
      await expect(page.getByTestId('task-title-input')).toHaveValue('Original Title');
    });

    test('should save an updated title', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-edit');
      await page.getByTestId('task-title-input').clear();
      await page.getByTestId('task-title-input').fill('Updated Title');
      await page.getByTestId('task-save-button').click();
      await expect(page.getByTestId('task-card').first()).toContainText('Updated Title');
    });

    test('should save an updated description', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-edit');
      await page.getByTestId('task-description-input').clear();
      await page.getByTestId('task-description-input').fill('New description');
      await page.getByTestId('task-save-button').click();
      await expect(page.getByTestId('task-card').first()).toContainText('New description');
    });

    test('should revert changes on cancel', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-edit');
      await page.getByTestId('task-title-input').clear();
      await page.getByTestId('task-title-input').fill('Will be discarded');
      await page.getByTestId('task-cancel-button').click();
      await expect(page.getByTestId('task-card').first()).toContainText('Original Title');
      await expect(page.getByTestId('task-card').first()).not.toContainText('Will be discarded');
    });

    test('should delete the task if title is cleared and cancelled', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-edit');
      await page.getByTestId('task-title-input').clear();
      await page.getByTestId('task-cancel-button').click();
      await expect(page.getByTestId('task-card')).toHaveCount(0);
    });

    test('should not allow editing two tasks simultaneously', async ({ page }) => {
      await addTask(page, 'Second Task');
      await openTaskMenu(page, 0);
      await clickMenuItem(page, 'task-menu-edit');
      await expect(page.getByTestId('task-title-input')).toBeVisible();

      await openTaskMenu(page, 0);
      await expect(page.getByTestId('task-menu-edit')).toBeDisabled();
    });
  });

  test.describe('completion', () => {
    test.beforeEach(async ({ page }) => {
      await addTask(page, 'Completable Task');
    });

    test('should mark a task as completed', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-complete');
      const title = page.getByTestId('task-card').first().locator('text=Completable Task');
      await expect(title).toHaveCSS('text-decoration-line', 'line-through');
    });

    test('should show "mark as uncompleted" option for a completed task', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-complete');
      await openTaskMenu(page);
      await expect(page.getByTestId('task-menu-complete')).toContainText(/uncompleted/i);
    });

    test('should unmark a completed task', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-complete');
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-complete');
      const title = page.getByTestId('task-card').first().locator('text=Completable Task');
      await expect(title).not.toHaveCSS('text-decoration-line', 'line-through');
    });

    test('should show default cursor on a completed task', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-complete');
      await expect(page.getByTestId('task-card').first()).toHaveCSS('cursor', 'default');
    });
  });

  test.describe('deletion', () => {
    test.beforeEach(async ({ page }) => {
      await addTask(page, 'Task to archive');
    });

    test('should show a confirmation dialog before archiving', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-delete');
      await expect(page.locator('.swal2-popup')).toBeVisible();
      await expect(page.locator('.swal2-popup')).toContainText(/archive/i);
    });

    test('should archive the task after confirmation', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-delete');
      await page.locator('.swal2-confirm').click();
      await expect(page.getByTestId('task-card')).toHaveCount(0);
    });

    test('should keep the task when cancelling deletion', async ({ page }) => {
      await openTaskMenu(page);
      await clickMenuItem(page, 'task-menu-delete');
      await page.locator('.swal2-deny').click();
      await expect(page.getByTestId('task-card')).toHaveCount(1);
    });

    test('should reorder remaining tasks after one is archived', async ({ page }) => {
      await addTask(page, 'Second task');
      await openTaskMenu(page, 0);
      await clickMenuItem(page, 'task-menu-delete');
      await page.locator('.swal2-confirm').click();
      await expect(page.getByTestId('task-card')).toHaveCount(1);
      await expect(page.getByTestId('task-card').first()).toContainText('#1');
    });
  });

  test.describe('reordering', () => {
    test.beforeEach(async ({ page }) => {
      await addTask(page, 'First Task');
      await addTask(page, 'Second Task');
    });

    test('should display most recently added task at the top', async ({ page }) => {
      const cards = page.getByTestId('task-card');
      await expect(cards.nth(0)).toContainText('Second Task');
      await expect(cards.nth(1)).toContainText('First Task');
    });

    test('should show a drag handle on each task', async ({ page }) => {
      await expect(page.getByTestId('task-drag-handle')).toHaveCount(2);
    });

    test('should reorder tasks via keyboard drag-and-drop', async ({ page, browserName }) => {
      test.skip(
        browserName !== 'chromium',
        'keyboard DnD via dnd-kit is reliable in Chromium only'
      );

      const firstHandle = page.getByTestId('task-drag-handle').nth(0);

      await firstHandle.focus();
      await firstHandle.press('Space');
      await page.waitForTimeout(100);
      await firstHandle.press('ArrowDown');
      await page.waitForTimeout(100);
      await firstHandle.press('Space');
      await page.waitForTimeout(300);

      const cards = page.getByTestId('task-card');
      await expect(cards.nth(0)).toContainText('First Task');
      await expect(cards.nth(1)).toContainText('Second Task');
    });
  });
});
