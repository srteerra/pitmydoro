import { expect, Page, test } from '@playwright/test';

const STORE_KEY = 'pitmydoro_tasks';

type StoredStats = {
  totalWorkTime: number;
  totalBreakTime: number;
  totalPausedTime: number;
  totalPauses: number;
  totalInterruptions: number;
} | null;

type StoredTask = {
  id: string;
  totalPomodoros: number;
  stats: StoredStats;
} | null;

async function addTask(page: Page, title: string) {
  await page.getByTestId('addTask-button').click();
  await page.getByTestId('task-title-input').fill(title);
  await page.getByTestId('task-save-button').click();
  await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
}

async function selectTask(page: Page, title: string) {
  await page.getByTestId('task-card').filter({ hasText: title }).click();
}

async function startTimer(page: Page) {
  await page.getByRole('button', { name: 'Start' }).click();
}

async function pauseTimer(page: Page) {
  await page.getByRole('button', { name: 'Pause' }).click();
}

async function readTask(page: Page, title: string): Promise<StoredTask> {
  return page.evaluate(
    ([key, taskTitle]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const tasks = parsed?.state?.tasks ?? [];
      const task = tasks.find((t: { title: string }) => t.title === taskTitle);
      if (!task) return null;
      return {
        id: task.id,
        totalPomodoros: task.totalPomodoros ?? 0,
        stats: task.stats ?? null,
      };
    },
    [STORE_KEY, title] as const
  );
}

test.describe('Task stats tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => localStorage.removeItem(key), STORE_KEY);
    await page.goto('/');
  });

  test('records work time against the task when a session is paused', async ({ page }) => {
    const title = 'Focus work';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(3000);
    await pauseTimer(page);

    const task = await readTask(page, title);
    expect(task).not.toBeNull();
    expect(task!.id).toBeTruthy();
    expect(task!.stats).not.toBeNull();
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(0);
    expect(task!.stats!.totalBreakTime).toBe(0);
  });

  test('records elapsed work time when changing the timer mid-session', async ({ page }) => {
    const title = 'Switch timer';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(3000);

    await page.locator('[data-pw-id="tire-3"]').click();

    const task = await readTask(page, title);
    expect(task!.stats).not.toBeNull();
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(0);
  });

  test('records paused time and pause count across a pause/resume cycle', async ({ page }) => {
    const title = 'Pause cycle';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(1500);
    await pauseTimer(page);
    await page.waitForTimeout(3000);
    await startTimer(page);

    const task = await readTask(page, title);
    expect(task!.stats!.totalPauses).toBe(1);
    expect(task!.stats!.totalPausedTime).toBeGreaterThan(0);
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(0);
  });

  test('records break time during a break session', async ({ page }) => {
    const title = 'Break task';
    await addTask(page, title);
    await selectTask(page, title);

    await page.getByTestId('short-break-label').click();
    await expect(page.getByTestId('timer-label')).toContainText('05:00');

    await startTimer(page);
    await page.waitForTimeout(3000);
    await pauseTimer(page);

    const task = await readTask(page, title);
    expect(task!.stats).not.toBeNull();
    expect(task!.stats!.totalBreakTime).toBeGreaterThan(0);
    expect(task!.stats!.totalWorkTime).toBe(0);
  });

  test('captures elapsed time when the page is hidden or closed', async ({ page }) => {
    const title = 'Do not lose me';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(3000);

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('pagehide'));
    });

    const task = await readTask(page, title);
    expect(task!.stats).not.toBeNull();
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(0);
  });

  test('keeps stats isolated to the active task', async ({ page }) => {
    await addTask(page, 'Active one');
    await addTask(page, 'Idle two');

    await selectTask(page, 'Active one');

    await startTimer(page);
    await page.waitForTimeout(2500);
    await pauseTimer(page);

    const active = await readTask(page, 'Active one');
    const idle = await readTask(page, 'Idle two');

    expect(active!.stats!.totalWorkTime).toBeGreaterThan(0);
    expect(idle?.stats?.totalWorkTime ?? 0).toBe(0);
  });

  test('counts every pause across multiple pause/resume cycles', async ({ page }) => {
    const title = 'Multi pause';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(1500);
    await pauseTimer(page);
    await page.waitForTimeout(1000);
    await startTimer(page);
    await page.waitForTimeout(1500);
    await pauseTimer(page);

    const task = await readTask(page, title);
    expect(task!.stats!.totalPauses).toBe(2);
    expect(task!.stats!.totalPausedTime).toBeGreaterThan(0);
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(0);
  });

  test('renders the work-time stat in seconds for a short session', async ({ page }) => {
    const title = 'Render seconds';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(3000);
    await pauseTimer(page);

    await page
      .getByTestId('task-card')
      .filter({ hasText: title })
      .getByTestId('task-menu-trigger')
      .click();
    await page.getByTestId('task-menu-stats').click();

    const workTime = page.getByTestId('stat-work-time');
    await expect(workTime).toBeVisible();
    await expect(workTime).toHaveText(/^\d+s$/);
    await expect(workTime).not.toContainText('mins');
    await expect(workTime).not.toContainText('hrs');
  });

  test('stores durations as whole seconds without decimals', async ({ page }) => {
    const title = 'Seconds unit';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(4000);
    await pauseTimer(page);

    const task = await readTask(page, title);
    expect(Number.isInteger(task!.stats!.totalWorkTime)).toBe(true);
    expect(task!.stats!.totalWorkTime).toBeGreaterThan(1);
    expect(task!.stats!.totalWorkTime).toBeLessThan(60);
  });

  test('accumulates work time additively across separate work intervals', async ({ page }) => {
    const title = 'Accumulate work';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(2000);
    await pauseTimer(page);
    const first = await readTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(2000);
    await pauseTimer(page);
    const second = await readTask(page, title);

    expect(first!.stats!.totalWorkTime).toBeGreaterThan(0);
    expect(second!.stats!.totalWorkTime).toBeGreaterThan(first!.stats!.totalWorkTime);
  });
});

test.describe('Task stats persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('keeps recorded stats in local storage across a reload', async ({ page }) => {
    const title = 'Survive reload';
    await addTask(page, title);
    await selectTask(page, title);

    await startTimer(page);
    await page.waitForTimeout(3000);
    await pauseTimer(page);

    const before = await readTask(page, title);
    expect(before!.stats!.totalWorkTime).toBeGreaterThan(0);

    await page.reload();
    await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();

    const after = await readTask(page, title);
    expect(after).not.toBeNull();
    expect(after!.stats!.totalWorkTime).toBe(before!.stats!.totalWorkTime);
    expect(after!.totalPomodoros).toBe(before!.totalPomodoros);
  });
});

test.describe('Decimal stats handling', () => {
  const seedTaskWithStats = (page: Page, title: string, stats: Record<string, number>) =>
    page.addInitScript(
      ([key, taskTitle, taskStats]) => {
        const nowSeconds = Math.floor(Date.now() / 1000);
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 0,
            state: {
              currentTask: null,
              tasks: [
                {
                  id: 'seeded-task',
                  title: taskTitle,
                  description: '',
                  estimatedPomodoros: 4,
                  totalPomodoros: 3,
                  archive: false,
                  stats: {
                    ...(taskStats as Record<string, number>),
                    lastSessionAt: { seconds: nowSeconds, nanoseconds: 0 },
                  },
                },
              ],
            },
          })
        );
      },
      [STORE_KEY, title, stats] as const
    );

  const openStats = async (page: Page, title: string) => {
    await expect(page.getByTestId('task-card').filter({ hasText: title })).toBeVisible();
    await page
      .getByTestId('task-card')
      .filter({ hasText: title })
      .getByTestId('task-menu-trigger')
      .click();
    await page.getByTestId('task-menu-stats').click();
  };

  test('renders decimal durations as -/- without converting them', async ({ page }) => {
    const title = 'Decimal task';
    await seedTaskWithStats(page, title, {
      totalWorkTime: 18.32,
      totalBreakTime: 0.1854544444,
      totalPausedTime: 13.949,
      totalPauses: 4,
      totalInterruptions: 1,
    });
    await page.goto('/');
    await openStats(page, title);

    await expect(page.getByTestId('stat-work-time')).toHaveText('-/-');
    await expect(page.getByTestId('stat-break-time')).toHaveText('-/-');
    await expect(page.getByTestId('stat-paused-time')).toHaveText('-/-');
    await expect(page.getByTestId('stat-pauses')).toHaveText('4');
    await expect(page.getByTestId('stat-interruptions')).toHaveText('1');
    await expect(page.getByTestId('stats-corrupted-warning')).toBeVisible();
  });

  test('renders whole-second durations directly without migrating', async ({ page }) => {
    const title = 'Whole seconds task';
    await seedTaskWithStats(page, title, {
      totalWorkTime: 90,
      totalBreakTime: 30,
      totalPausedTime: 5,
      totalPauses: 2,
      totalInterruptions: 0,
    });
    await page.goto('/');
    await openStats(page, title);

    await expect(page.getByTestId('stat-work-time')).toHaveText('1mins 30s');
    await expect(page.getByTestId('stat-break-time')).toHaveText('30s');
    await expect(page.getByTestId('stat-paused-time')).toHaveText('5s');
    await expect(page.getByTestId('stats-corrupted-warning')).toHaveCount(0);
  });
});
