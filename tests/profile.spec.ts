import { expect, test } from '@playwright/test';

const nonExistentUsername = () => `nouser${Date.now()}${Math.floor(Math.random() * 1000)}`;

test.describe('Public profile by username', () => {
  test('shows the not-found state for a username that does not exist', async ({ page }) => {
    await page.goto(`/profile/${nonExistentUsername()}`);

    await expect(page.getByTestId('profile-not-found')).toBeVisible();
    await expect(page.getByTestId('profile-not-found-home')).toBeVisible();
  });

  test('go home button leaves the profile route', async ({ page }) => {
    await page.goto(`/profile/${nonExistentUsername()}`);

    await page.getByTestId('profile-not-found-home').click();

    await expect(page).not.toHaveURL(/\/profile\//);
  });
});
