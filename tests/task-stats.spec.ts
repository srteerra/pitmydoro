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

test.describe('Task stats tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((key) => localStorage.removeItem(key), STORE_KEY);
    await page.goto('/');
  });

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
});
