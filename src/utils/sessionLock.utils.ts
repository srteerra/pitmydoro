const LOCK_KEY = 'pitmydoro_session_lock';

export const LOCK_HEARTBEAT_MS = 4_000;
const LOCK_STALE_MS = 12_000;
const LOCK_POLL_MS = 2_000;

interface SessionLockRecord {
  tabId: string;
  startedAt: number;
  updatedAt: number;
}

const createTabId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const tabId = createTabId();

const listeners = new Set<() => void>();

let lockedByOtherTab = false;
let heldByThisTab = false;
let pollId: ReturnType<typeof setInterval> | null = null;

const readLock = (): SessionLockRecord | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LOCK_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (typeof parsed?.tabId !== 'string' || typeof parsed?.updatedAt !== 'number') return null;

    return parsed as SessionLockRecord;
  } catch {
    return null;
  }
};

const freshLock = (): SessionLockRecord | null => {
  const lock = readLock();
  if (!lock) return null;

  return Date.now() - lock.updatedAt < LOCK_STALE_MS ? lock : null;
};

const sync = () => {
  const lock = freshLock();
  const nextLockedByOther = !!lock && lock.tabId !== tabId;
  const nextHeldByThis = !!lock && lock.tabId === tabId;

  if (nextLockedByOther === lockedByOtherTab && nextHeldByThis === heldByThisTab) return;

  lockedByOtherTab = nextLockedByOther;
  heldByThisTab = nextHeldByThis;
  listeners.forEach((listener) => listener());
};

const writeLock = (startedAt: number) => {
  try {
    window.localStorage.setItem(
      LOCK_KEY,
      JSON.stringify({ tabId, startedAt, updatedAt: Date.now() })
    );
  } catch {
    return;
  }

  sync();
};

export const claimSessionLock = (): boolean => {
  if (typeof window === 'undefined') return true;

  const lock = freshLock();
  if (lock && lock.tabId !== tabId) return false;

  writeLock(lock?.startedAt ?? Date.now());

  return true;
};

export const refreshSessionLock = (): boolean => claimSessionLock();

export const releaseSessionLock = () => {
  if (typeof window === 'undefined') return;

  const lock = readLock();
  if (lock && lock.tabId !== tabId) return;

  try {
    window.localStorage.removeItem(LOCK_KEY);
  } catch {
    return;
  }

  sync();
};

export const isSessionLockedByOtherTab = () => lockedByOtherTab;

export const checkSessionLockedByOtherTab = (): boolean => {
  const lock = freshLock();

  return !!lock && lock.tabId !== tabId;
};

export const subscribeSessionLock = (listener: () => void) => {
  listeners.add(listener);

  if (listeners.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('storage', sync);
    pollId = setInterval(sync, LOCK_POLL_MS);
  }

  sync();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', sync);
      if (pollId) clearInterval(pollId);
      pollId = null;
    }
  };
};
