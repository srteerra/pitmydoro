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
import {
  DISPLAY_NAME_MAX_LENGTH,
  displayNameHasProfanity,
  isDisplayNameTooLong,
  normalizeDisplayName,
} from '@/utils/displayName.utils';
import { buildHeatmap } from '@/utils/statsHeatmap.utils';
import { BADGES } from '@/constants/Badges';
import { findBadge, isBadgeOwned, resolveBadges, resolveFeaturedBadge } from '@/utils/badges.utils';
import en from '../messages/en.json';
import es from '../messages/es.json';
import { periodRange, rollingYearRange, sumTotals } from '@/utils/statsReport.utils';
import { DailyStats } from '@/interfaces/Stats.interface';

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

const dailyStats = (entries: Partial<DailyStats>[]) => entries as DailyStats[];

test.describe('Profile stats totals', () => {
  test('adds up every metric inside the range', () => {
    const stats = dailyStats([
      {
        date: '2026-01-10',
        workTime: 60,
        pomodoroTime: 50,
        breakTime: 20,
        pausedTime: 10,
        pomodoros: 2,
        pauses: 3,
        tasksCompleted: 1,
        tasksCreated: 4,
      },
      {
        date: '2026-01-11',
        workTime: 40,
        pomodoroTime: 25,
        breakTime: 5,
        pausedTime: 0,
        pomodoros: 1,
        pauses: 1,
        tasksCompleted: 2,
        tasksCreated: 0,
      },
    ]);

    expect(sumTotals(stats, '2026-01-10', '2026-01-11')).toEqual({
      workTime: 100,
      pomodoroTime: 75,
      breakTime: 25,
      pausedTime: 10,
      pomodoros: 3,
      pauses: 4,
      tasksCompleted: 3,
      tasksCreated: 4,
    });
  });

  test('ignores days outside the range and missing counters', () => {
    const stats = dailyStats([
      { date: '2026-01-09', workTime: 999, pomodoros: 9 },
      { date: '2026-01-10', workTime: 60, pomodoros: 2 },
    ]);

    const totals = sumTotals(stats, '2026-01-10', '2026-01-10');

    expect(totals.workTime).toBe(60);
    expect(totals.pomodoroTime).toBe(0);
    expect(totals.pomodoros).toBe(2);
    expect(totals.pauses).toBe(0);
    expect(totals.tasksCompleted).toBe(0);
  });

  test('never starts a period after today', () => {
    const { from, to } = periodRange('day');

    expect(from).toBe(to);
  });
});

test.describe('Profile activity heatmap', () => {
  const range = rollingYearRange();

  test('fills whole iso weeks over the rolling year', () => {
    const { weeks } = buildHeatmap([], range.from, range.to);
    const days = weeks.flatMap((week) => week.days);

    expect(weeks.length).toBeGreaterThanOrEqual(52);
    expect(days.length).toBe(weeks.length * 7);
    expect(new Date(`${days[0].date}T00:00:00`).getDay()).toBe(1);
  });

  test('scales levels against the best day', () => {
    const stats = dailyStats([
      { date: range.to, pomodoros: 8, pomodoroTime: 1000 },
      { date: range.from, pomodoros: 2, pomodoroTime: 500 },
    ]);

    const { weeks, total, bestDay } = buildHeatmap(stats, range.from, range.to);
    const days = weeks.flatMap((week) => week.days);
    const cellFor = (date: string) => days.find((day) => day.date === date);

    expect(total).toBe(10);
    expect(bestDay).toBe(8);
    expect(cellFor(range.to)?.level).toBe(4);
    expect(cellFor(range.from)?.level).toBe(1);
    expect(days.filter((day) => day.pomodoros === 0).every((day) => day.level === 0)).toBe(true);
  });

  test('flags the days after today so they are not painted', () => {
    const { weeks } = buildHeatmap([], range.from, range.to);
    const days = weeks.flatMap((week) => week.days);

    expect(days.filter((day) => day.isFuture).length).toBeLessThan(7);
    expect(days.every((day) => !day.isFuture || day.pomodoros === 0)).toBe(true);
  });

  test('labels each month once in reading order', () => {
    const { months } = buildHeatmap([], range.from, range.to);
    const keys = months.map((month) => month.key);
    const indexes = months.map((month) => month.weekIndex);

    expect(new Set(keys).size).toBe(keys.length);
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);
    expect(months[0].weekIndex).toBe(0);
  });
});

test.describe('Profile display name rules', () => {
  test('collapses whitespace and trims', () => {
    expect(normalizeDisplayName('  Angel   Lopez  ')).toBe('Angel Lopez');
    expect(normalizeDisplayName('\n Max \t Verstappen ')).toBe('Max Verstappen');
    expect(normalizeDisplayName(undefined)).toBe('');
    expect(normalizeDisplayName(null)).toBe('');
  });

  test('caps the length on the normalized value', () => {
    expect(DISPLAY_NAME_MAX_LENGTH).toBe(30);
    expect(isDisplayNameTooLong('a'.repeat(DISPLAY_NAME_MAX_LENGTH))).toBe(false);
    expect(isDisplayNameTooLong('a'.repeat(DISPLAY_NAME_MAX_LENGTH + 1))).toBe(true);
    expect(isDisplayNameTooLong(`  ${'a'.repeat(DISPLAY_NAME_MAX_LENGTH)}  `)).toBe(false);
    expect(isDisplayNameTooLong('')).toBe(false);
  });

  test('rejects profanity in both languages', () => {
    expect(displayNameHasProfanity('El Mierda')).toBe(true);
    expect(displayNameHasProfanity('shit racer')).toBe(true);
    expect(displayNameHasProfanity('accented mierdá')).toBe(true);
    expect(displayNameHasProfanity('Angel Lopez')).toBe(false);
    expect(displayNameHasProfanity('')).toBe(false);
  });

  test('stays free otherwise, unlike the username', () => {
    const freeNames = ['Ángel L. 🏎', 'max_verstappen 33', 'THE Doctor', 'a'];

    freeNames.forEach((name) => {
      expect(isDisplayNameTooLong(name)).toBe(false);
      expect(displayNameHasProfanity(name)).toBe(false);
    });
  });
});

test.describe('Profile badges', () => {
  test('returns nothing when the profile carries no badges', () => {
    expect(resolveBadges(undefined)).toEqual([]);
    expect(resolveBadges(null)).toEqual([]);
    expect(resolveBadges({})).toEqual([]);
  });

  test('keeps the canonical order no matter how the map is written', () => {
    const owned = resolveBadges({ isDesigner: true, isDev: true, isStreamer: true });

    expect(owned.map((badge) => badge.id)).toEqual(['streamer', 'dev', 'designer']);
  });

  test('only counts flags that are actually on', () => {
    const owned = resolveBadges({
      isDev: true,
      isStreamer: false,
      isSupporter: undefined,
    });

    expect(owned.map((badge) => badge.id)).toEqual(['dev']);
  });

  test('tolerates the shapes a manual Firestore edit can produce', () => {
    expect(resolveBadges({ isDev: 'true' } as never).map((b) => b.id)).toEqual(['dev']);
    expect(resolveBadges({ isDev: 1 } as never).map((b) => b.id)).toEqual(['dev']);
    expect(resolveBadges({ isDev: 'false' } as never)).toEqual([]);
    expect(resolveBadges({ isDev: 0 } as never)).toEqual([]);
    expect(resolveBadges({ notABadge: true } as never)).toEqual([]);
  });

  test('every badge is uniquely identified and coloured', () => {
    const ids = BADGES.map((badge) => badge.id);
    const flags = BADGES.map((badge) => badge.flag);
    const colors = BADGES.map((badge) => badge.color);

    expect(new Set(ids).size).toBe(BADGES.length);
    expect(new Set(flags).size).toBe(BADGES.length);
    expect(new Set(colors).size).toBe(BADGES.length);
    BADGES.forEach((badge) => {
      expect(badge.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(badge.flag).toBe(`is${badge.id[0].toUpperCase()}${badge.id.slice(1)}`);
    });
  });

  test('every badge carries a drawable glyph', () => {
    BADGES.forEach((badge) => {
      const shapes = (badge.glyph.paths?.length ?? 0) + (badge.glyph.circles?.length ?? 0);
      expect(shapes).toBeGreaterThan(0);
    });
  });

  test('every badge is translated in both locales', () => {
    BADGES.forEach((badge) => {
      [en, es].forEach((messages) => {
        const entry = (
          messages.badges as unknown as Record<string, { name: string; description: string }>
        )[badge.id];

        expect(entry?.name?.length ?? 0).toBeGreaterThan(0);
        expect(entry?.description?.length ?? 0).toBeGreaterThan(0);
      });
    });
  });

  test('looks a badge up by id', () => {
    expect(findBadge('dev')?.flag).toBe('isDev');
    expect(findBadge('nope' as never)).toBeUndefined();
  });
});

test.describe('Featured badge', () => {
  const owner = { isDev: true, isStreamer: true };

  test('knows which badges the profile actually owns', () => {
    expect(isBadgeOwned(owner, 'dev')).toBe(true);
    expect(isBadgeOwned(owner, 'streamer')).toBe(true);
    expect(isBadgeOwned(owner, 'supporter')).toBe(false);
    expect(isBadgeOwned(undefined, 'dev')).toBe(false);
    expect(isBadgeOwned(owner, 'nope' as never)).toBe(false);
  });

  test('resolves the badge worn next to the name', () => {
    expect(resolveFeaturedBadge(owner, 'dev')?.id).toBe('dev');
    expect(resolveFeaturedBadge(owner, null)).toBeNull();
    expect(resolveFeaturedBadge(owner, undefined)).toBeNull();
  });

  test('refuses to show a featured badge the profile does not own', () => {
    expect(resolveFeaturedBadge(owner, 'supporter')).toBeNull();
    expect(resolveFeaturedBadge({}, 'dev')).toBeNull();
    expect(resolveFeaturedBadge(undefined, 'dev')).toBeNull();
  });

  test('stops showing a badge that was revoked while worn', () => {
    expect(resolveFeaturedBadge({ isDev: true }, 'dev')?.id).toBe('dev');
    expect(resolveFeaturedBadge({ isDev: false }, 'dev')).toBeNull();
  });

  test('labels every equip state in both locales', () => {
    [
      'pickerTitle',
      'pickerHint',
      'equipLabel',
      'unequipLabel',
      'changeBadge',
      'lockedLabel',
      'lockedPreviewLabel',
      'lockedHint',
      'backToPicker',
    ].forEach((key) => {
      [en, es].forEach((messages) => {
        const value = (messages.badges as unknown as Record<string, string>)[key];
        expect(value?.length ?? 0).toBeGreaterThan(0);
      });
    });
  });
});
