import _ from 'lodash';
import { Task } from '@/interfaces/Task.interface';
import { TaskViewEnum } from '@/enums/TaskView.enum';
import { timestampUtils } from '@/utils/timestamp.utils';

export const matchesTaskView = (task: Task, view: TaskViewEnum) => {
  if (view === TaskViewEnum.ARCHIVED) return !!task.archive;
  if (task.archive) return false;

  return view === TaskViewEnum.COMPLETED ? !!task.completedAt : !task.completedAt;
};

const archivedSortKey = (task: Task) =>
  timestampUtils.toMillis(task.archiveAt) || timestampUtils.toMillis(task.createdAt) || 0;

export const mergeArchivedTasks = (remoteTasks: Task[], localTasks: Task[]) => {
  const byId = new Map(remoteTasks.map((task) => [task.id, task]));
  localTasks.forEach((task) => byId.set(task.id, task));

  return _.orderBy(
    [...byId.values()].filter((task) => task.archive),
    archivedSortKey,
    'desc'
  );
};
