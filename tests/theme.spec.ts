import { expect, test } from '@playwright/test';
import { getThemeSwitcher } from './helpers';

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display theme switcher', async ({ page }) => {
    await expect(await getThemeSwitcher(page)).toBeVisible();
  });

  test('should handle click', async ({ page }) => {
    const themeSwitcher = await getThemeSwitcher(page);

    await expect(themeSwitcher).toBeVisible();
    await themeSwitcher.click();
  });

  test('should switch theme', async ({ page }) => {
    const themeSwitcher = await getThemeSwitcher(page);
    await expect(themeSwitcher).toBeVisible();

    const getBodyBgColor = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const colorBefore = await getBodyBgColor();

    await themeSwitcher.click();

    await expect.poll(getBodyBgColor, { timeout: 5_000 }).not.toBe(colorBefore);
  });
});
