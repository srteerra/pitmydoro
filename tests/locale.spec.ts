import { test, expect } from '@playwright/test';

test.describe('Locale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the locale switcher', async ({ page }) => {
    const localeSwitcher = page.getByTestId('locale-switcher');
    await expect(localeSwitcher).toBeVisible();
  });

  test('should display options and handle click', async ({ page }) => {
    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    const localeContent = page.getByTestId('locale-content');
    await expect(localeContent).toBeVisible();

    const menuItems = page.getByTestId('locale-menuItem');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(1);

    for (let i = 0; i < count; i++) {
      await expect(menuItems.nth(i)).toBeVisible();
      await expect(menuItems.nth(i)).toBeEnabled();
    }

    await menuItems.first().click();
    await localeSwitcher.click();
    await expect(localeContent).toBeVisible();
  });

  test('should change english to spanish', async ({ page }) => {
    const addTaskButton = page.getByTestId('addTask-button');
    const originalText = await addTaskButton.textContent();

    const localeSwitcher = page.getByTestId('locale-switcher');
    await localeSwitcher.click();

    const localeContent = page.getByTestId('locale-content');
    await expect(localeContent).toBeVisible();

    const menuItems = page.getByTestId('locale-menuItem');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(1);

    let spanishIndex = -1;
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent();
      if (text?.includes('Español')) {
        spanishIndex = i;
        break;
      }
    }

    expect(spanishIndex).toBeGreaterThan(-1);

    const spanishOption = menuItems.nth(spanishIndex);
    await expect(spanishOption).toBeVisible();
    await expect(spanishOption).toBeEnabled();
    await spanishOption.click();

    await expect(addTaskButton).not.toHaveText(originalText!);
    await expect(addTaskButton).toBeVisible();
  });
});
