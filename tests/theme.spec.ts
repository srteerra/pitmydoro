import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display theme switcher', async ({ page }) => {
    const themeSwitcher = page.getByTestId('theme-switcher');
    await expect(themeSwitcher).toBeVisible();
  });

  test('should handle click', async ({ page }) => {
    const themeSwitcher = page.getByTestId('theme-switcher');
    await expect(themeSwitcher).toBeVisible();

    await themeSwitcher.click();
  });

  test('should switch theme', async ({ page }) => {
    const themeSwitcher = page.getByTestId('theme-switcher');
    await expect(themeSwitcher).toBeVisible();

    const getBodyBgColor = () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const colorBefore = await getBodyBgColor();

    await themeSwitcher.click();

    const colorAfter = await getBodyBgColor();

    expect(colorAfter).not.toBe(colorBefore);
  });
});
