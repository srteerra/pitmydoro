import { assertEmulatorReachable, db, projectId } from '../test/emulator.mjs';
import { runLeaderboardRefresh } from '../lib/leaderboard/index.js';
import { createRandom } from './seed/random.mjs';
import { PEOPLE } from './seed/people.mjs';
import { buildUser } from './seed/profiles.mjs';
import { buildSeedFollows, buildViewerSocial } from './seed/social.mjs';
import { removeSeedData, removeViewerSeedData } from './seed/cleanup.mjs';
import { DEMO_ACCOUNT, ensureDemoAccount } from './seed/demoAccount.mjs';
import { writeUserDocuments } from './seed/writers.mjs';

const RANDOM_SEED = 2026;
const HOURS = 3600;

const countBy = (items, key) =>
  items.reduce((acc, item) => acc.set(item[key], (acc.get(item[key]) ?? 0) + 1), new Map());

const findViewers = async (firestore) => {
  const snapshot = await firestore.collection('profiles').get();
  return snapshot.docs.map((doc) => ({ uid: doc.id, username: doc.get('username') }));
};

const buildViewerPlans = (random, viewers, users, now) =>
  viewers.map((viewer) => ({ viewer, ...buildViewerSocial(random, viewer.uid, users, now) }));

const collectFollows = (seedFollows, viewerPlans) => [
  ...seedFollows,
  ...viewerPlans.flatMap(({ viewer, following, followers }) => [
    ...following.map((item) => ({ followerId: viewer.uid, ...item })),
    ...followers.map((item) => ({ followeeId: viewer.uid, ...item })),
  ]),
];

const writeUsers = (firestore, writer, users, followers, following) => {
  users.forEach((user) =>
    writeUserDocuments(firestore, writer, user, {
      followersCount: followers.get(user.uid) ?? 0,
      followingCount: following.get(user.uid) ?? 0,
    })
  );
};

const writeFollows = (firestore, writer, follows) => {
  follows.forEach(({ followerId, followeeId, doc }) =>
    writer.set(
      firestore.collection('users').doc(followerId).collection('following').doc(followeeId),
      doc
    )
  );
};

const writeNotifications = (firestore, writer, viewerPlans) => {
  viewerPlans.forEach(({ viewer, notifications }) =>
    notifications.forEach(({ id, doc }) =>
      writer.set(
        firestore.collection('users').doc(viewer.uid).collection('notifications').doc(id),
        doc
      )
    )
  );
};

const syncViewerCounters = async (firestore, viewers, followers) => {
  for (const viewer of viewers) {
    const followingRef = firestore.collection('users').doc(viewer.uid).collection('following');
    const followingCount = (await followingRef.count().get()).data().count;
    await firestore
      .collection('profiles')
      .doc(viewer.uid)
      .set({ followersCount: followers.get(viewer.uid) ?? 0, followingCount }, { merge: true });
  }
};

const printDemoAccount = (created) => {
  if (!created) return;
  console.log(`\nDemo account: ${DEMO_ACCOUNT.email} / ${DEMO_ACCOUNT.password}`);
};

const printSummary = async (firestore, users, viewers) => {
  const current = (await firestore.collection('leaderboards').doc('_current').get()).data();
  const hours = (seconds) => (seconds / HOURS).toFixed(1);

  console.log(`\nSeeded ${users.length} users in "${projectId}".`);
  console.log(
    `Viewers configured: ${viewers.map((viewer) => `@${viewer.username}`).join(', ') || 'none'}`
  );
  console.log('\nWeekly top 10');
  console.table(
    current.weekly.top.slice(0, 10).map(({ rank, username, pomodoroTime }) => ({
      rank,
      username,
      hours: hours(pomodoroTime),
    }))
  );
  console.log('Weekly constructors');
  console.table(
    current.weekly.constructors.map(({ rank, teamId, pomodoroTime, drivers }) => ({
      rank,
      teamId,
      hours: hours(pomodoroTime),
      drivers,
    }))
  );
};

const main = async () => {
  await assertEmulatorReachable();
  const firestore = db();
  const now = Date.now();
  const random = createRandom(RANDOM_SEED);

  await removeSeedData(firestore);
  const demoCreated = await ensureDemoAccount(firestore, now);
  const viewers = await findViewers(firestore);
  await Promise.all(viewers.map((viewer) => removeViewerSeedData(firestore, viewer.uid)));

  const users = PEOPLE.map((person) => buildUser(random, person, now));
  const viewerPlans = buildViewerPlans(random, viewers, users, now);
  const follows = collectFollows(buildSeedFollows(random, users, now), viewerPlans);
  const followers = countBy(follows, 'followeeId');
  const following = countBy(follows, 'followerId');

  const writer = firestore.bulkWriter();
  writeUsers(firestore, writer, users, followers, following);
  writeFollows(firestore, writer, follows);
  writeNotifications(firestore, writer, viewerPlans);
  await writer.close();

  await syncViewerCounters(firestore, viewers, followers);
  await runLeaderboardRefresh(now);
  await printSummary(firestore, users, viewers);
  printDemoAccount(demoCreated);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
