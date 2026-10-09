import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { refreshLeaderboards } from './leaderboard';
export { onFollowCreated, onFollowDeleted, onBroadcastCreated } from './social';
