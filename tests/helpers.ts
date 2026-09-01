import { expect, Locator, Page } from '@playwright/test';

export const SETTINGS_KEY = 'pitmydoro_settings';
export const STICKY_NOTES_KEY = 'pitmydoro_sticky_notes';
export const TASKS_KEY = 'pitmydoro_tasks';

const DESKTOP_BREAKPOINT = 1024;
const OVERLAY_RESET_MS = 300;

export const isMobileLayout = (page: Page) =>
  (page.viewportSize()?.width ?? DESKTOP_BREAKPOINT) < DESKTOP_BREAKPOINT;

export const clearStores = (page: Page, keys: string[]) =>
  page.addInitScript((storeKeys: string[]) => {
    if (sessionStorage.getItem('pw-stores-cleared')) return;

    sessionStorage.setItem('pw-stores-cleared', '1');
    storeKeys.forEach((key) => localStorage.removeItem(key));
  }, keys);

export async function openMobileMenu(page: Page): Promise<Locator> {
  const menu = page.getByTestId('mobile-menu');

  if (!(await menu.isVisible())) await page.getByTestId('mobile-menu-button').click();

  await expect(menu).toBeVisible();

  return menu;
}

export async function closeDrawer(page: Page) {
  const drawer = page.getByTestId('drawer');

  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(drawer).toBeHidden();
  await page.waitForTimeout(OVERLAY_RESET_MS);
}

export async function getThemeSwitcher(page: Page): Promise<Locator> {
  if (!isMobileLayout(page)) return page.getByTestId('theme-switcher');

  const menu = await openMobileMenu(page);

  return menu.getByTestId('theme-switcher');
}

export async function openSettingsDialog(page: Page): Promise<Locator> {
  const dialog = page.getByTestId('dialog');

  if (!(await dialog.isVisible())) await page.getByTestId('settings-button').click();

  await expect(dialog).toBeVisible();

  return dialog;
}

export async function closeSettingsDialog(page: Page) {
  const dialog = page.getByTestId('dialog');

  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.waitForTimeout(OVERLAY_RESET_MS);
}

export async function openLocaleMenu(page: Page): Promise<Locator> {
  const scope = isMobileLayout(page) ? await openSettingsDialog(page) : page;
  const switcher = scope.getByTestId('locale-switcher');

  await switcher.scrollIntoViewIfNeeded();
  await switcher.click();

  const content = scope.getByTestId('locale-content');
  await expect(content).toBeVisible();

  return content;
}

export async function openModeMenu(page: Page): Promise<Locator> {
  const scope = isMobileLayout(page) ? await openMobileMenu(page) : page;

  await scope.getByTestId('pomodoro-mode-switcher').click();

  const content = page.getByTestId('pomodoro-mode-content');
  await expect(content).toBeVisible();

  return content;
}

export async function selectMode(page: Page, mode: 'f1' | 'minimal') {
  const content = await openModeMenu(page);

  await content.getByTestId(`pomodoro-mode-${mode}`).click();
  await expect(content).toBeHidden();

  if (isMobileLayout(page)) await closeDrawer(page);
}

export const readSettings = (page: Page) =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);

    return raw ? JSON.parse(raw).state : null;
  }, SETTINGS_KEY);

export const readNotes = (page: Page) =>
  page.evaluate((key) => {
    const raw = localStorage.getItem(key);

    return raw ? (JSON.parse(raw).state?.notes ?? []) : [];
  }, STICKY_NOTES_KEY);

export const clickStickyTab = (tab: Locator) => tab.click({ position: { x: 190, y: 20 } });

export async function addStickyNote(page: Page): Promise<Locator> {
  if (!isMobileLayout(page)) {
    await clickStickyTab(page.getByTestId('sticky-note-add'));

    const panel = page.getByTestId('sticky-note-panel').last();
    await expect(panel.getByTestId('sticky-note-content')).toBeVisible();

    return panel;
  }

  await page.getByTestId('sticky-notes-fab').click();
  await expect(page.getByTestId('sticky-notes-list')).toBeVisible();
  await page.getByTestId('sticky-notes-list-add').click();

  const editor = page.getByTestId('drawer');
  await expect(editor.getByTestId('sticky-note-content')).toBeVisible();

  return editor;
}
