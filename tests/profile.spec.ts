import { expect, test } from '@playwright/test';
import { BIO_MAX_LENGTH, bioHasLink, bioHasProfanity } from '@/utils/bio.utils';
import { isValidSocialUrl, normalizeSocialUrl } from '@/utils/socials.utils';
import {
  bannerFromColor,
  DEFAULT_PROFILE_BANNER,
  DEFAULT_PROFILE_THEME,
  resolveTeam,
  themeFromTeam,
} from '@/utils/profileTheme.utils';
import { timestampUtils } from '@/utils/timestamp.utils';
import { SCUDERIAS } from '@/constants/Scuderias';

const nonExistentUsername = () => `nouser${Date.now()}${Math.floor(Math.random() * 1000)}`;

test.describe('Public profile by username', () => {
  test('shows the not-found state for a username that does not exist', async ({ page }) => {
    await page.goto(`/profile/${nonExistentUsername()}`);

    await expect(page.getByTestId('profile-not-found')).toBeVisible();
    await expect(page.getByTestId('profile-not-found-home')).toBeVisible();
    await expect(page.getByTestId('profile-card')).toHaveCount(0);
  });

  test('names the missing username in the not-found copy', async ({ page }) => {
    const username = nonExistentUsername();
    await page.goto(`/profile/${username}`);

    await expect(page.getByTestId('profile-not-found')).toContainText(username);
  });

  test('go home button leaves the profile route', async ({ page }) => {
    await page.goto(`/profile/${nonExistentUsername()}`);

    await page.getByTestId('profile-not-found-home').click();

    await expect(page).not.toHaveURL(/\/profile\//, { timeout: 20_000 });
  });

  test('keeps the not-found state usable after a reload', async ({ page }) => {
    const username = nonExistentUsername();
    await page.goto(`/profile/${username}`);

    await expect(page.getByTestId('profile-not-found')).toBeVisible();

    await page.reload();

    await expect(page.getByTestId('profile-not-found-home')).toBeVisible();
  });

  test('hides the pomodoro mode switch on the profile route', async ({ page }) => {
    await page.goto(`/profile/${nonExistentUsername()}`);

    await expect(page.getByTestId('profile-not-found')).toBeVisible();
    await expect(page.getByTestId('pomodoro-mode-switcher')).toHaveCount(0);
  });
});

test.describe('Own profile route', () => {
  test('redirects an anonymous visitor back home', async ({ page }) => {
    await page.goto('/profile');

    await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
    await expect(page.getByTestId('timer-label')).toBeVisible({ timeout: 20_000 });
  });
});

test.describe('Profile theme resolution', () => {
  test('falls back to the default banner colour', () => {
    expect(bannerFromColor(undefined)).toBe(DEFAULT_PROFILE_BANNER);
    expect(bannerFromColor(null)).toBe(DEFAULT_PROFILE_BANNER);
    expect(bannerFromColor('')).toBe(DEFAULT_PROFILE_BANNER);
    expect(bannerFromColor('#123456')).toBe('#123456');
  });

  test('resolves a favourite team by id', () => {
    const team = SCUDERIAS[0];

    expect(resolveTeam(team.id)?.name).toBe(team.name);
    expect(resolveTeam('not_a_team')).toBeNull();
    expect(resolveTeam(null)).toBeNull();
    expect(resolveTeam(undefined)).toBeNull();
  });

  test('derives a profile theme from the team palette', () => {
    const team = SCUDERIAS[0];

    expect(themeFromTeam(team)).toEqual({
      background: team.colors.background.session,
      accent: team.colors.background.shortBreak,
      primary: team.colors.primary.default,
    });
  });

  test('exposes a neutral default theme', () => {
    expect(Object.keys(DEFAULT_PROFILE_THEME).sort()).toEqual(['accent', 'background', 'primary']);
  });
});

test.describe('Profile bio rules', () => {
  test('caps the bio length', () => {
    expect(BIO_MAX_LENGTH).toBe(250);
  });

  test('detects links', () => {
    expect(bioHasLink('visit https://pitmydoro.com')).toBe(true);
    expect(bioHasLink('www.pitmydoro.com')).toBe(true);
    expect(bioHasLink('pitmydoro.com')).toBe(true);
    expect(bioHasLink('just a racing fan')).toBe(false);
  });

  test('detects profanity in both languages', () => {
    expect(bioHasProfanity('this is shit')).toBe(true);
    expect(bioHasProfanity('esto es mierda')).toBe(true);
    expect(bioHasProfanity('accented mierdá')).toBe(true);
    expect(bioHasProfanity('a clean bio about racing')).toBe(false);
    expect(bioHasProfanity('')).toBe(false);
  });
});

test.describe('Profile social links', () => {
  test('accepts the supported domains', () => {
    expect(isValidSocialUrl('instagram', 'https://instagram.com/pitmydoro')).toBe(true);
    expect(isValidSocialUrl('instagram', 'www.instagram.com/pitmydoro')).toBe(true);
    expect(isValidSocialUrl('twitch', 'twitch.tv/pitmydoro')).toBe(true);
    expect(isValidSocialUrl('discord', 'https://discord.gg/invite')).toBe(true);
    expect(isValidSocialUrl('twitter', 'https://x.com/pitmydoro')).toBe(true);
    expect(isValidSocialUrl('twitter', 'https://twitter.com/pitmydoro')).toBe(true);
  });

  test('rejects foreign or malformed urls', () => {
    expect(isValidSocialUrl('instagram', 'https://facebook.com/pitmydoro')).toBe(false);
    expect(isValidSocialUrl('twitch', 'https://x.com/pitmydoro')).toBe(false);
    expect(isValidSocialUrl('discord', 'not a url at all')).toBe(false);
  });

  test('treats an empty value as valid so the field stays optional', () => {
    expect(isValidSocialUrl('instagram')).toBe(true);
    expect(isValidSocialUrl('instagram', '   ')).toBe(true);
  });

  test('normalizes urls with a protocol', () => {
    expect(normalizeSocialUrl('instagram.com/pitmydoro')).toBe('https://instagram.com/pitmydoro');
    expect(normalizeSocialUrl('http://twitch.tv/pitmydoro')).toBe('http://twitch.tv/pitmydoro');
    expect(normalizeSocialUrl('  x.com/pitmydoro  ')).toBe('https://x.com/pitmydoro');
    expect(normalizeSocialUrl(undefined)).toBe('');
  });
});

test.describe('Profile timestamps', () => {
  test('reads millis from every shape the profile can carry', () => {
    expect(timestampUtils.toMillis(undefined)).toBe(0);
    expect(timestampUtils.toMillis(1_700_000_000_000)).toBe(1_700_000_000_000);
    expect(timestampUtils.toMillis({ toMillis: () => 42 })).toBe(42);
    expect(timestampUtils.toMillis({ seconds: 2, nanoseconds: 500_000_000 })).toBe(2500);
  });

  test('renders a dash when there is no date', () => {
    expect(timestampUtils.formatDate(undefined)).toBe('—');
  });
});
