import { test, expect } from '@playwright/test';

test.describe('Pomodoro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the scuderia logo', async ({ page }) => {
    const scuderiaLogo = page.getByTestId('scuderia-logo');
    await expect(scuderiaLogo).toBeVisible();
    await expect(scuderiaLogo).toHaveAttribute('alt', /scuderia/i);
    await expect(scuderiaLogo).toHaveAttribute('src');
  });

  test('should display the scuderia sprite', async ({ page }) => {
    const scuderiaSprite = page.getByTestId('scuderia-sprite');
    await expect(scuderiaSprite).toBeVisible();
  });

  test('should load the sprite image completely', async ({ page }) => {
    const scuderiaSprite = page.getByTestId('scuderia-sprite');
    await expect(scuderiaSprite).toBeVisible();

    const bgImage = await scuderiaSprite.evaluate(
      (el) => window.getComputedStyle(el).backgroundImage
    );

    expect(bgImage).not.toBe('none');
    expect(bgImage).toContain('url');

    const boundingBox = await scuderiaSprite.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test('should have correct initial sprite CSS properties', async ({ page }) => {
    const scuderiaSprite = page.getByTestId('scuderia-sprite');
    await expect(scuderiaSprite).toBeVisible();

    const sprite = await scuderiaSprite.evaluate(
      (el) => window.getComputedStyle(el).backgroundImage
    );
    expect(sprite).not.toBe('none');

    await expect(scuderiaSprite).toHaveCSS('z-index', '2');
    await expect(scuderiaSprite).toHaveCSS('animation', 'none');

    const bgSize = await scuderiaSprite.evaluate(
      (el) => window.getComputedStyle(el).backgroundSize
    );
    expect(bgSize).not.toBe('auto');
  });

  test('should change timer between session type', async ({ page }) => {
    const timer = page.getByTestId('timer-label');
    await expect(timer).toBeVisible();

    await expect(timer).toContainText('25:00');
    await page.getByTestId('short-break-label').click();
    await expect(timer).toContainText('05:00');
    await page.getByTestId('long-break-label').click();
    await expect(timer).toContainText('15:00');
    await page.getByTestId('session-label').click();
    await expect(timer).toContainText('25:00');
  });

  test('should change timers', async ({ page }) => {
    const timer = page.getByTestId('timer-label');

    await expect(timer).toBeVisible();
    await expect(timer).toContainText('25:00');

    await page.locator('[data-pw-id="tire-0"]').click();
    await expect(timer).toContainText('15:00');

    await page.locator('[data-pw-id="tire-1"]').click();
    await expect(timer).toContainText('20:00');

    await page.locator('[data-pw-id="tire-3"]').click();
    await expect(timer).toContainText('30:00');

    await page.locator('[data-pw-id="tire-4"]').click();
    await expect(timer).toContainText('35:00');

    await page.locator('[data-pw-id="tire-2"]').click();
    await expect(timer).toContainText('25:00');
  });

  test('should start/pause a timer and reset works', async ({ page }) => {
    const timer = page.getByTestId('timer-label');

    await expect(timer).toBeVisible();
    await expect(timer).toContainText('25:00');

    await page.getByRole('button', { name: 'Start' }).click();

    await page.waitForTimeout(5000);
    await expect(page).toHaveTitle(/24:5/);
    await page.waitForTimeout(5000);

    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page).not.toHaveTitle(/24:5/);

    await expect(timer).toContainText('24:50');
    await expect(page.getByTestId('flag-yellow')).toBeVisible();

    await page.getByTestId('reset-button').click();
    await page.getByTestId('reset-timer-menu-item').click();

    await expect(page.getByRole('dialog', { name: 'Are you sure you want to' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await page.getByRole('button', { name: 'Accept' }).click();

    await expect(timer).toContainText('25:00');
    await expect(page.getByTestId('flag-red')).toBeVisible();
    await expect(page.getByTestId('flag-yellow')).not.toBeVisible();

    await expect(page).not.toHaveTitle(/25:00/);
  });
});
