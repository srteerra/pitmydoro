import { usePomodoroStore } from '@/stores/Pomodoro.store';
import { useTaskStore } from '@/stores/Tasks.store';
import useSettingsStore from '@/stores/Settings.store';
import { PomodoroRecord } from '@/interfaces/Task.interface';

const activeSpriteId = () => useSettingsStore.getState().currentScuderia?.id ?? 'unknown';

export const startPomodoroEntry = (taskId: string, timer: number) => {
  const spriteId = activeSpriteId();
  const task = useTaskStore.getState().tasks.find((t) => t.id === taskId);
  const index = (task?.stats?.pomodoros?.length ?? 0) + 1;

  usePomodoroStore.getState().setCurrentPomodoroEntry({
    taskId,
    index,
    startedAt: Date.now(),
    timer,
    workTime: 0,
    pausedTime: 0,
    pauses: 0,
    sprites: { [spriteId]: 0 },
    activeSprite: spriteId,
  });
};

export const getDominantSprite = (sprites: Record<string, number>): string | undefined => {
  const entries = Object.entries(sprites);
  if (entries.length === 0) return undefined;

  return entries.sort((a, b) => b[1] - a[1])[0][0];
};

export const creditPomodoroWork = (seconds: number) => {
  const { currentPomodoroEntry: entry, setCurrentPomodoroEntry } = usePomodoroStore.getState();
  if (!entry) return;

  setCurrentPomodoroEntry({
    ...entry,
    workTime: entry.workTime + seconds,
    sprites: {
      ...entry.sprites,
      [entry.activeSprite]: (entry.sprites[entry.activeSprite] ?? 0) + seconds,
    },
  });
};

export const creditPomodoroPause = (seconds: number) => {
  const { currentPomodoroEntry: entry, setCurrentPomodoroEntry } = usePomodoroStore.getState();
  if (!entry) return;

  setCurrentPomodoroEntry({ ...entry, pausedTime: entry.pausedTime + seconds });
};

export const incrementPomodoroPause = () => {
  const { currentPomodoroEntry: entry, setCurrentPomodoroEntry } = usePomodoroStore.getState();
  if (!entry) return;

  setCurrentPomodoroEntry({ ...entry, pauses: entry.pauses + 1 });
};

export const rebindSprite = (spriteId: string) => {
  const { currentPomodoroEntry: entry, setCurrentPomodoroEntry } = usePomodoroStore.getState();
  if (!entry || entry.activeSprite === spriteId) return;

  setCurrentPomodoroEntry({
    ...entry,
    activeSprite: spriteId,
    sprites: { ...entry.sprites, [spriteId]: entry.sprites[spriteId] ?? 0 },
  });
};

export const finalizePomodoroEntry = (completed: boolean): PomodoroRecord | null => {
  const { currentPomodoroEntry: entry, setCurrentPomodoroEntry } = usePomodoroStore.getState();
  if (!entry) return null;

  setCurrentPomodoroEntry(null);

  return {
    index: entry.index,
    startedAt: entry.startedAt,
    endedAt: Date.now(),
    workTime: entry.workTime,
    pausedTime: entry.pausedTime,
    pauses: entry.pauses,
    timer: entry.timer,
    sprites: entry.sprites,
    completed,
  };
};
