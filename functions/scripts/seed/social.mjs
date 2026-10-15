import { Timestamp } from 'firebase-admin/firestore';
import { MS_PER_DAY } from './activity.mjs';

const MS_PER_HOUR = 3_600_000;
const MAX_SEED_FAVORITES = 5;
const VIEWER_FOLLOWING = 10;
const VIEWER_FAVORITES = 6;
const VIEWER_FOLLOWERS = 14;
const READ_AFTER_DAYS = 3;

const followDoc = (uid, favorite, createdAtMs) => ({
  uid,
  favorite,
  createdAt: Timestamp.fromMillis(createdAtMs),
});

const actorOf = (user) => ({
  uid: user.uid,
  username: user.username,
  displayName: user.displayName,
  photoURL: null,
});

export const buildSeedFollows = (random, users, now) => {
  const follows = [];

  for (const user of users) {
    const others = users.filter((other) => other.uid !== user.uid);
    const targets = random.sample(others, random.int(2, 14));
    const favorites = new Set(random.sample(targets, random.int(0, MAX_SEED_FAVORITES)));

    targets.forEach((target) =>
      follows.push({
        followerId: user.uid,
        followeeId: target.uid,
        doc: followDoc(target.uid, favorites.has(target), now - random.int(1, 120) * MS_PER_DAY),
      })
    );
  }

  return follows;
};

const followNotification = (follower, createdAtMs, now) => ({
  id: `follow_${follower.uid}`,
  doc: {
    type: 'follow',
    actor: actorOf(follower),
    title: null,
    body: null,
    link: `/profile/${follower.username}`,
    read: now - createdAtMs > READ_AFTER_DAYS * MS_PER_DAY,
    createdAt: Timestamp.fromMillis(createdAtMs),
  },
});

const SYSTEM_NOTIFICATIONS = [
  {
    id: 'broadcast_seed_constructors',
    hoursAgo: 5,
    title: { es: 'Nuevo: Campeonato de Constructores', en: "New: Constructors' Championship" },
    body: {
      es: 'Tu tiempo de enfoque ahora suma para tu escudería favorita. ¿Quién va primero?',
      en: 'Your focus time now scores for your favorite team. Who is leading?',
    },
    link: '/leaderboard',
  },
  {
    id: 'broadcast_seed_welcome',
    hoursAgo: 24 * 9,
    title: { es: '¡Bienvenido a Pit My Doro!', en: 'Welcome to Pit My Doro!' },
    body: {
      es: 'Sigue a otros pilotos y márcalos como favoritos para competir con ellos.',
      en: 'Follow other drivers and mark them as favorites to compete with them.',
    },
    link: null,
  },
];

const systemNotifications = (now) =>
  SYSTEM_NOTIFICATIONS.map(({ id, hoursAgo, title, body, link }) => ({
    id,
    doc: {
      type: 'system',
      actor: null,
      title,
      body,
      link,
      read: hoursAgo > 24,
      createdAt: Timestamp.fromMillis(now - hoursAgo * MS_PER_HOUR),
    },
  }));

export const buildViewerSocial = (random, viewerId, users, now) => {
  const active = users.filter((user) => user.personaId !== 'dormant');
  const following = random.sample(active, VIEWER_FOLLOWING);
  const favorites = new Set(following.slice(0, VIEWER_FAVORITES));
  const followers = random.sample(users, VIEWER_FOLLOWERS);
  const followerTimes = followers.map(() => now - random.int(1, 240) * MS_PER_HOUR);

  return {
    following: following.map((user) => ({
      followeeId: user.uid,
      doc: followDoc(user.uid, favorites.has(user), now - random.int(1, 30) * MS_PER_DAY),
    })),
    followers: followers.map((user, index) => ({
      followerId: user.uid,
      doc: followDoc(viewerId, false, followerTimes[index]),
    })),
    notifications: [
      ...followers.map((user, index) => followNotification(user, followerTimes[index], now)),
      ...systemNotifications(now),
    ],
  };
};
