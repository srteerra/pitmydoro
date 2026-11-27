import { expect, test } from '@playwright/test';
import { openSettingsDialog, readSettings } from './helpers';

test.describe('Early alert setting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('cookie-accept').click({ timeout: 15_000 });
  });

  test('saves once after quick changes', async ({ page }) => {
    const dialog = await openSettingsDialog(page);
    const increase = dialog.getByRole('button', { name: 'Increase early alert time' });

    await increase.click();
    await increase.click();
    await increase.click();

    await expect(dialog.getByTestId('early-alert-saving')).toBeVisible();
    await expect(dialog.getByTestId('early-alert-saving')).toBeHidden({ timeout: 5_000 });

    await expect(page.getByText('Settings saved successfully')).toHaveCount(1);
    expect((await readSettings(page))?.earlyAlertSeconds).toBe(7);
  });
});
