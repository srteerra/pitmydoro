import { Project, ProjectLinked } from '@/interfaces/Project.interface';
import { sortPinnedFirst } from '@/utils/pin.utils';

export interface ProjectGroup<T> {
  project: Project | null;
  items: T[];
}

export const belongsToProject = (item: ProjectLinked, projectId: string | null) =>
  !projectId || item.projectId === projectId;

export const filterByProject = <T extends ProjectLinked>(items: T[], projectId: string | null) =>
  projectId ? items.filter((item) => item.projectId === projectId) : items;

export const findNextInProject = <T extends ProjectLinked>(items: T[], projectId: string | null) =>
  items.find((item) => belongsToProject(item, projectId));

export const mergeSubsetOrder = <T extends { id: string }>(fullList: T[], reorderedSubset: T[]) => {
  const subsetIds = new Set(reorderedSubset.map((item) => item.id));
  const queue = [...reorderedSubset];

  return fullList.map((item) => (subsetIds.has(item.id) ? (queue.shift() ?? item) : item));
};

export const groupItemsByProject = <T extends ProjectLinked>(
  items: T[],
  projects: Project[]
): ProjectGroup<T>[] => {
  const knownIds = new Set(projects.map((project) => project.id));
  const projectGroups = sortPinnedFirst(projects).map((project) => ({
    project,
    items: items.filter((item) => item.projectId === project.id),
  }));
  const unassigned = items.filter((item) => !item.projectId || !knownIds.has(item.projectId));

  return [...projectGroups, { project: null, items: unassigned }].filter(
    (group) => group.items.length > 0
  );
};
