import { expect, test } from '@playwright/test';
import { closeSettingsDialog, isMobileLayout, openLocaleMenu } from './helpers';

test.describe('Locale', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the locale switcher', async ({ page }) => {
    const content = await openLocaleMenu(page);

    await expect(content).toBeVisible();
  });

  test('should display options and handle click', async ({ page }) => {
    const content = await openLocaleMenu(page);
    const menuItems = content.getByTestId('locale-menuItem');

    await expect(menuItems).toHaveCount(2);

    for (const item of await menuItems.all()) {
      await expect(item).toBeVisible();
      await expect(item).toBeEnabled();
    }

    await menuItems.first().click();
    await expect(await openLocaleMenu(page)).toBeVisible();
  });

  test('should change english to spanish', async ({ page }) => {
    const addTaskButton = page.getByTestId('addTask-button');
    const originalText = await addTaskButton.textContent();

    const content = await openLocaleMenu(page);
    const spanishOption = content.getByTestId('locale-menuItem').filter({ hasText: 'Español' });

    await expect(spanishOption).toHaveCount(1);
    await expect(spanishOption).toBeEnabled();
    await spanishOption.click();

    if (isMobileLayout(page)) await closeSettingsDialog(page);

    await expect(addTaskButton).toBeVisible();
    await expect(addTaskButton).not.toHaveText(originalText!, { timeout: 20_000 });
  });
});
