import { Timestamp } from 'firebase-admin/firestore';
import { buildActivity, buildStreak } from './activity.mjs';
import { PERSONA_WEIGHTS, POMODORO_LENGTHS } from './personas.mjs';
import {
  BACKGROUNDS,
  BADGE_FLAGS,
  BADGE_WEIGHTS,
  BIOS,
  DEFAULT_THEME,
  TEAM_THEMES,
  TEAM_WEIGHTS,
} from './people.mjs';

export const SEED_PREFIX = 'seed_';
const MS_PER_HOUR = 3_600_000;

const buildSocials = (random, username, badge) => {
  const socials = {};
  if (badge === 'streamer' || random.chance(0.1)) socials.twitch = `https://twitch.tv/${username}`;
  if (random.chance(0.2)) socials.github = `https://github.com/${username}`;
  if (random.chance(0.2)) socials.instagram = `https://instagram.com/${username}`;
  return Object.keys(socials).length > 0 ? socials : null;
};

const buildBadges = (random, badge) => {
  if (!badge) return { badges: null, featuredBadge: null };
  return {
    badges: { [BADGE_FLAGS[badge]]: true },
    featuredBadge: random.chance(0.7) ? badge : null,
  };
};

const lastConnectionOf = (random, days, createdAt) => {
  const lastDay = days[days.length - 1];
  const base = lastDay ? Date.parse(lastDay.date) : createdAt;
  return Timestamp.fromMillis(base + random.int(8, 23) * MS_PER_HOUR);
};

export const buildUser = (random, person, now, overrides = {}) => {
  const uid = overrides.uid ?? `${SEED_PREFIX}${person.username}`;
  const personaId = overrides.personaId ?? random.weighted(PERSONA_WEIGHTS);
  const teamId = overrides.teamId === undefined ? random.weighted(TEAM_WEIGHTS) : overrides.teamId;
  const badge = random.weighted(BADGE_WEIGHTS);
  const pomodoroLength = random.weighted(POMODORO_LENGTHS);
  const { createdAt, days } = buildActivity(random, { personaId, pomodoroLength, teamId }, now);
  const createdAtTimestamp = Timestamp.fromMillis(createdAt + random.int(8, 22) * MS_PER_HOUR);
  const lastConnection = lastConnectionOf(random, days, createdAt);

  const profile = {
    username: person.username,
    displayName: person.displayName,
    bio: random.pick(BIOS),
    location: random.chance(0.75) ? person.location : '',
    favoriteTeam: teamId,
    favoriteFlag: random.chance(0.85) ? person.flag : null,
    profileTheme: teamId ? TEAM_THEMES[teamId] : DEFAULT_THEME,
    profileBackground: random.pick(BACKGROUNDS),
    socials: buildSocials(random, person.username, badge),
    ...buildBadges(random, badge),
    streak: buildStreak(days, now),
    createdAt: createdAtTimestamp,
    updatedAt: lastConnection,
    lastConnection,
  };

  return {
    uid,
    username: person.username,
    displayName: person.displayName,
    personaId,
    profile,
    days,
    account: {
      email: overrides.email ?? `${person.username}@example.com`,
      createdAt: createdAtTimestamp,
      updatedAt: lastConnection,
      lastConnection,
    },
  };
};

export const isSeedId = (id) => id.startsWith(SEED_PREFIX);
