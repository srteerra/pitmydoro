import { expect, test } from '@playwright/test';
import {
  clearStores,
  closeSettingsDialog,
  openModeMenu,
  openSettingsDialog,
  readSettings,
  selectMode,
  SETTINGS_KEY,
  TASKS_KEY,
} from './helpers';

test.describe('Pomodoro mode switch', () => {
  test.beforeEach(async ({ page }) => {
    await clearStores(page, [SETTINGS_KEY, TASKS_KEY]);
    await page.goto('/');
  });

  test('offers both modes with formula 1 selected by default', async ({ page }) => {
    const content = await openModeMenu(page);

    await expect(content.getByTestId('pomodoro-mode-f1')).toBeVisible();
    await expect(content.getByTestId('pomodoro-mode-minimal')).toBeVisible();
  });

  test('renders the racing chrome while in formula 1 mode', async ({ page }) => {
    await expect(page.getByTestId('timer-selector')).toBeVisible();
    await expect(page.getByTestId('scuderia-logo')).toBeVisible();
    await expect(page.getByTestId('scuderia-sprite')).toBeVisible();
    await expect(page.getByTestId('simple-timer')).toHaveCount(0);
  });

  test('switching to minimal hides the racing chrome and shows the simple timer', async ({
    page,
  }) => {
    await selectMode(page, 'minimal');

    await expect(page.getByTestId('simple-timer')).toBeVisible();
    await expect(page.getByTestId('timer-selector')).toHaveCount(0);
    await expect(page.getByTestId('scuderia-logo')).toHaveCount(0);
    await expect(page.getByTestId('scuderia-sprite')).toHaveCount(0);
  });

  test('keeps the session tabs and the countdown available in minimal mode', async ({ page }) => {
    await selectMode(page, 'minimal');

    const timer = page.getByTestId('timer-label');
    await expect(timer).toContainText('25:00');

    await page.getByTestId('short-break-label').click();
    await expect(timer).toContainText('05:00');

    await page.getByTestId('long-break-label').click();
    await expect(timer).toContainText('15:00');

    await page.getByTestId('session-label').click();
    await expect(timer).toContainText('25:00');
  });

  test('marks the active mode inside the menu', async ({ page }) => {
    const f1Menu = await openModeMenu(page);

    await expect(f1Menu.getByTestId('pomodoro-mode-f1').locator('svg')).toHaveCount(1);
    await expect(f1Menu.getByTestId('pomodoro-mode-minimal').locator('svg')).toHaveCount(0);
    await expect(f1Menu.getByTestId('pomodoro-mode-f1').locator('img')).toHaveCount(1);

    await f1Menu.getByTestId('pomodoro-mode-minimal').click();
    await expect(f1Menu).toBeHidden();

    const minimalMenu = await openModeMenu(page);

    await expect(minimalMenu.getByTestId('pomodoro-mode-minimal').locator('svg')).toHaveCount(1);
    await expect(minimalMenu.getByTestId('pomodoro-mode-f1').locator('svg')).toHaveCount(0);
  });

  test('persists the selected mode across a reload', async ({ page }) => {
    await selectMode(page, 'minimal');

    await expect.poll(async () => (await readSettings(page))?.mode).toBe('minimal');

    await page.reload();

    await expect(page.getByTestId('simple-timer')).toBeVisible();
    await expect(page.getByTestId('timer-selector')).toHaveCount(0);
  });

  test('switches back from minimal to formula 1', async ({ page }) => {
    await selectMode(page, 'minimal');
    await expect(page.getByTestId('simple-timer')).toBeVisible();

    await selectMode(page, 'f1');

    await expect(page.getByTestId('simple-timer')).toHaveCount(0);
    await expect(page.getByTestId('timer-selector')).toBeVisible();
    await expect.poll(async () => (await readSettings(page))?.mode).toBe('f1');
  });

  test('edits the minimal session duration and applies it to the countdown', async ({ page }) => {
    await selectMode(page, 'minimal');

    const preview = page.getByTestId('simple-timer-session-preview');
    await expect(preview).toHaveText('25');

    await preview.click();
    await page.getByTestId('simple-timer-session-input').fill('40');
    await page.keyboard.press('Enter');

    await expect(preview).toHaveText('40');
    await expect(page.getByTestId('timer-label')).toContainText('40:00');

    await expect.poll(async () => (await readSettings(page))?.minimalSessionDuration).toBe(40);
  });

  test('edits the minimal break durations', async ({ page }) => {
    await selectMode(page, 'minimal');

    const shortBreak = page.getByTestId('simple-timer-short-break-preview');
    await shortBreak.click();
    await page.getByTestId('simple-timer-short-break-input').fill('7');
    await page.keyboard.press('Enter');

    await expect(shortBreak).toHaveText('7');

    await page.getByTestId('short-break-label').click();
    await expect(page.getByTestId('timer-label')).toContainText('07:00');
  });

  test('drops the tyre settings section while in minimal mode', async ({ page }) => {
    const f1Dialog = await openSettingsDialog(page);

    await expect(f1Dialog).toContainText('Timers');
    await closeSettingsDialog(page);

    await selectMode(page, 'minimal');

    const minimalDialog = await openSettingsDialog(page);

    await expect(minimalDialog).toContainText('Language');
    await expect(minimalDialog).not.toContainText('Timers');
    await closeSettingsDialog(page);
  });

  test('hides the mode switch outside the pomodoro page', async ({ page }) => {
    await page.goto('/learn');

    await expect(page.getByTestId('pomodoro-mode-switcher')).toHaveCount(0);
  });
});
