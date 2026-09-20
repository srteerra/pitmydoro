import { expect, type Page, test } from '@playwright/test';
import { openSettingsDialog } from './helpers';

const WET = 'tire-4';
const INTERMEDIATE = 'tire-3';
const DRY = 'tire-2';

const RAIN = '[data-pw-id="pomodoro-rain"]';

// The element needs a moment to buffer enough of the track to start playing. Generous, but not
// so long that a genuine stall would pass unnoticed.
const AUDIO_TIMEOUT = 20_000;

const rainOverlay = (page: Page) => page.locator(RAIN);

const dismissCookies = async (page: Page) => {
  await page.getByTestId('cookie-accept').click({ timeout: 15_000 });
};

const audioProbe = () => {
  const elements = Array.from(
    document.querySelectorAll('audio[data-pw-id="rain-audio"]')
  ) as HTMLAudioElement[];

  return {
    elements: elements.length,
    playing: elements.filter((audio) => !audio.paused && !audio.ended).length,
    loop: elements[0]?.loop ?? null,
    volume: elements[0] ? Math.round(elements[0].volume * 100) / 100 : null,
    seek: elements[0]?.currentTime ?? 0,
    source: elements[0]?.getAttribute('data-pw-track') ?? null,
  };
};

const playingCount = (page: Page) => page.evaluate(audioProbe).then((state) => state.playing);

test.describe('Wet weather rain', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookies(page);
  });

  test('stays off until the wet compound is selected', async ({ page }) => {
    await expect(rainOverlay(page)).toHaveCount(0);
    await expect(page.getByTestId('rain-sound-controls')).toHaveCount(0);

    await page.getByTestId(WET).click();

    await expect(rainOverlay(page)).toHaveCount(1);
    await expect(page.getByTestId('rain-sound-controls')).toBeVisible();
  });

  test('stops as soon as a dry compound is selected', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    await page.getByTestId(DRY).click();

    await expect(rainOverlay(page)).toHaveCount(0);
    await expect(page.getByTestId('rain-sound-controls')).toBeHidden();
  });

  test('covers the whole viewport, not just the pomodoro card', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    const overlay = await page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLElement;
      const rect = element.getBoundingClientRect();

      return {
        parent: element.parentElement?.tagName,
        position: getComputedStyle(element).position,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    }, RAIN);

    expect(overlay.parent).toBe('BODY');
    expect(overlay.position).toBe('fixed');
    expect(overlay.width).toBe(overlay.viewportWidth);
    expect(overlay.height).toBe(overlay.viewportHeight);
  });

  test('paints drops onto the canvas', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    await expect
      .poll(
        () =>
          page.evaluate((selector) => {
            const canvas = document.querySelector(`${selector} canvas`) as HTMLCanvasElement;
            const context = canvas?.getContext('2d');
            if (!context) return 0;

            const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
            let painted = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++;

            return painted;
          }, RAIN),
        { timeout: 10_000 }
      )
      .toBeGreaterThan(0);
  });

  test('dims the backdrop in light mode', async ({ page }) => {
    await page.getByTestId(WET).click();

    await expect(page.getByTestId('pomodoro-rain-vignette')).toHaveCount(1);
  });

  test('keeps the backing store within the device pixel cap', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    const size = await page.evaluate((selector) => {
      const canvas = document.querySelector(`${selector} canvas`) as HTMLCanvasElement;

      return {
        backing: canvas.width,
        css: canvas.getBoundingClientRect().width,
        dpr: window.devicePixelRatio,
      };
    }, RAIN);

    expect(size.css).toBeGreaterThan(100);
    expect(size.backing).toBe(Math.round(size.css * Math.min(size.dpr, 2)));
  });

  test('keeps the controls docked to the bottom-left while scrolling', async ({ page }) => {
    await page.getByTestId(WET).click();
    const controls = page.getByTestId('rain-sound-controls');
    await expect(controls).toBeVisible();

    const parked = () =>
      page.evaluate(() => {
        const box = document
          .querySelector('[data-pw-id="rain-sound-controls"]')!
          .getBoundingClientRect();

        return { gap: Math.round(window.innerHeight - box.bottom), left: Math.round(box.left) };
      });

    const before = await parked();
    expect(before.gap).toBeLessThan(80);
    expect(before.left).toBeLessThan(80);

    await page.evaluate(() =>
      document.getElementById('info-section')?.scrollIntoView({ block: 'start' })
    );

    await expect.poll(async () => (await parked()).gap).toBeLessThan(80);
  });

  test('does not swallow clicks on the timer underneath', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    await page.getByTestId('short-break-label').click();

    await expect(page.getByTestId('short-break-label')).toHaveAttribute('data-state', 'checked');
  });
});

test.describe('Intermediate weather rain', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookies(page);
  });

  test('rains on the intermediate compound too', async ({ page }) => {
    await page.getByTestId(INTERMEDIATE).click();

    await expect(rainOverlay(page)).toHaveCount(1);
    await expect(page.getByTestId('rain-sound-controls')).toBeVisible();

    await page.getByTestId(DRY).click();

    await expect(rainOverlay(page)).toHaveCount(0);
    await expect(page.getByTestId('rain-sound-controls')).toBeHidden();
  });

  test('collapses the track row on the way to intermediate', async ({ page }) => {
    await page.getByTestId(WET).click();

    const row = page.getByTestId('rain-sound-track');
    await expect(row).toBeVisible();

    await page.getByTestId(INTERMEDIATE).click();

    await expect(row).toBeHidden();

    await page.getByTestId(WET).click();

    await expect(row).toBeVisible();
  });

  test('falls lighter than the wet compound', async ({ page }) => {
    const paintedPixels = () =>
      page.evaluate((selector) => {
        const canvas = document.querySelector(`${selector} canvas`) as HTMLCanvasElement;
        const context = canvas?.getContext('2d');
        if (!context) return 0;

        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let painted = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) painted++;

        return painted;
      }, RAIN);

    await page.getByTestId(INTERMEDIATE).click();
    await expect(rainOverlay(page)).toHaveCount(1);
    await expect.poll(paintedPixels, { timeout: 10_000 }).toBeGreaterThan(0);

    const light = await paintedPixels();

    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);
    await expect.poll(paintedPixels, { timeout: 10_000 }).toBeGreaterThan(light);
  });

  test('leaves the backdrop alone in light mode', async ({ page }) => {
    await page.getByTestId(INTERMEDIATE).click();

    await expect(rainOverlay(page)).toHaveCount(1);
    await expect(page.getByTestId('pomodoro-rain-vignette')).toHaveCount(0);
  });

  test('loops the intermediate track and hides the track select', async ({ page }) => {
    await page.getByTestId(INTERMEDIATE).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const state = await page.evaluate(audioProbe);

    expect(state.source).toBe('sounds/rain-int.mp3');
    expect(state.loop).toBe(true);

    await expect(page.getByTestId('rain-sound-track')).toBeHidden();
    await expect(page.getByTestId('rain-sound-volume')).toBeVisible();
  });

  test('swaps the track when moving between intermediate and wet', async ({ page }) => {
    await page.getByTestId(INTERMEDIATE).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    await page.getByTestId(WET).click();

    await expect
      .poll(() => page.evaluate(audioProbe).then((probe) => probe.source))
      .toBe('sounds/rain-1.mp3');

    await expect.poll(() => page.evaluate(audioProbe).then((probe) => probe.elements)).toBe(1);
  });
});

test.describe('Wet weather rain in dark mode', () => {
  test('leaves the backdrop alone', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    await dismissCookies(page);

    await page.getByTestId(WET).click();
    await expect(rainOverlay(page)).toHaveCount(1);

    await expect(page.getByTestId('pomodoro-rain-vignette')).toHaveCount(0);
  });
});

test.describe('Wet weather rain sound', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookies(page);
  });

  test('loops while the wet compound is selected and stops when it is not', async ({ page }) => {
    expect(await playingCount(page)).toBe(0);

    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const state = await page.evaluate(audioProbe);
    expect(state.loop).toBe(true);

    await page.getByTestId(DRY).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(0);
  });

  test('keeps playing across session, short break and long break', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const first = await page.evaluate(audioProbe);

    await page.getByTestId('short-break-label').click();
    await page.getByTestId('long-break-label').click();

    const last = await page.evaluate(audioProbe);

    expect(last.playing).toBe(1);
    expect(last.seek).toBeGreaterThanOrEqual(first.seek);
  });

  test('mutes and unmutes from the sticky controls', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    await page.getByTestId('rain-sound-toggle').click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(0);

    await page.getByTestId('rain-sound-toggle').click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);
  });

  test('changes volume live without restarting the loop', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const thumb = page.getByTestId('rain-sound-volume').getByRole('slider');
    const currentVolume = () => page.evaluate(audioProbe).then((state) => state.volume);

    await thumb.focus();
    await thumb.press('End');
    await expect.poll(currentVolume).toBeGreaterThan(0.9);

    const before = await page.evaluate(audioProbe);

    // Arrow keys rather than Home: WebKit's slider does not act on Home.
    for (let step = 0; step < 25; step++) await thumb.press('ArrowLeft');

    await expect.poll(currentVolume).toBeLessThan(0.9);

    const after = await page.evaluate(audioProbe);

    expect(after.playing).toBe(1);
    expect(after.seek).toBeGreaterThanOrEqual(before.seek);
  });

  test('switches the looping track from the select', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const currentSource = () => page.evaluate(audioProbe).then((state) => state.source);

    expect(await currentSource()).toBe('sounds/rain-1.mp3');

    await page.getByTestId('rain-sound-track-trigger').click();
    await page.getByRole('option', { name: 'Rain 2' }).click();

    await expect.poll(currentSource).toBe('sounds/rain-2.mp3');
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem('pitmydoro_settings') || '{}')?.state?.rainTrack
    );

    expect(stored).toBe('rain-2');
  });

  test('leaves a single element behind after switching tracks', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    await page.getByTestId('rain-sound-track-trigger').click();
    await page.getByRole('option', { name: 'Rain 3' }).click();

    await expect.poll(() => page.evaluate(audioProbe).then((state) => state.elements)).toBe(1);
  });

  test('persists the volume once the drag ends', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    const thumb = page.getByTestId('rain-sound-volume').getByRole('slider');

    await thumb.focus();
    await thumb.press('End');

    await expect
      .poll(() => page.evaluate(audioProbe).then((state) => state.volume))
      .toBeGreaterThan(0.9);

    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem('pitmydoro_settings') || '{}')?.state?.rainVolume
        )
      )
      .toBeGreaterThan(0.9);
  });

  test('remembers the sound preference', async ({ page }) => {
    await page.getByTestId(WET).click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(1);

    await page.getByTestId('rain-sound-toggle').click();
    await expect.poll(() => playingCount(page), { timeout: AUDIO_TIMEOUT }).toBe(0);

    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem('pitmydoro_settings') || '{}')?.state?.rainSoundEnabled
    );

    expect(stored).toBe(false);
  });
});

test.describe('Rain hint in the timer settings', () => {
  test('badges the intermediate and wet compounds only', async ({ page }) => {
    await page.goto('/');
    await dismissCookies(page);

    const dialog = await openSettingsDialog(page);

    await expect(dialog.getByTestId('tire-rain-badge-3')).toBeVisible();
    await expect(dialog.getByTestId('tire-rain-badge-4')).toBeVisible();

    await expect(dialog.getByTestId('tire-rain-badge-0')).toHaveCount(0);
    await expect(dialog.getByTestId('tire-rain-badge-1')).toHaveCount(0);
    await expect(dialog.getByTestId('tire-rain-badge-2')).toHaveCount(0);
  });
});
