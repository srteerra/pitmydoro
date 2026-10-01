import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Project } from '@/interfaces/Project.interface';
import { createProject, useProjectsStore } from '@/stores/Projects.store';
import { useTaskStore } from '@/stores/Tasks.store';
import { useStickyNotesStore } from '@/stores/StickyNotes.store';
import { projectService } from '@/services/project.service';
import { taskService } from '@/services/task.service';
import { stickyNoteService } from '@/services/stickyNote.service';
import { useAuth } from '@/contexts/AuthContext';

const unlinkTasks = (projectId: string, userId?: string) => {
  const { tasks, updateTask } = useTaskStore.getState();
  const linked = tasks.filter((task) => task.projectId === projectId);

  linked.forEach((task) => updateTask(task.id, { projectId: null }));

  if (!userId) return [];

  return linked
    .filter((task) => task.isSync)
    .map((task) => taskService.update(userId, task.id, { projectId: null }));
};

const unlinkNotes = (projectId: string, userId?: string) => {
  const { notes, updateNote } = useStickyNotesStore.getState();
  const linked = notes.filter((note) => note.projectId === projectId);

  linked.forEach((note) => updateNote(note.id, { projectId: null }));

  if (!userId) return [];

  return linked
    .filter((note) => note.isSync)
    .map((note) => stickyNoteService.update(userId, note.id, { projectId: null }));
};

export function useResolveProjectName() {
  const t = useTranslations('projects');

  return useCallback((project: Project) => project.name.trim() || t('defaults.new'), [t]);
}

export function useProjects() {
  const { user } = useAuth();
  const setProjects = useProjectsStore((state) => state.setProjects);
  const addProjectToStore = useProjectsStore((state) => state.addProject);
  const updateProjectInStore = useProjectsStore((state) => state.updateProject);
  const removeProjectFromStore = useProjectsStore((state) => state.removeProject);
  const setActiveProject = useProjectsStore((state) => state.setActiveProject);

  const addProject = async (draft: Partial<Project> = {}) => {
    const project = { ...createProject(useProjectsStore.getState().projects, !!user), ...draft };
    addProjectToStore(project);

    if (user) await projectService.create(project, user.uid);

    return project;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    updateProjectInStore(id, updates);

    const project = useProjectsStore.getState().projects.find((item) => item.id === id);
    if (!user || !project?.isSync) return;

    await projectService.update(user.uid, id, updates);
  };

  const removeProject = async (id: string) => {
    const project = useProjectsStore.getState().projects.find((item) => item.id === id);
    removeProjectFromStore(id);

    const unlinkRequests = [...unlinkTasks(id, user?.uid), ...unlinkNotes(id, user?.uid)];

    if (user && project?.isSync) unlinkRequests.push(projectService.delete(user.uid, id));

    await Promise.all(unlinkRequests);
  };

  const reorderProjects = async (orderedProjects: Project[]) => {
    const changed = orderedProjects.filter((project, index) => project.order !== index);
    setProjects(orderedProjects.map((project, index) => ({ ...project, order: index })));

    if (!user) return;

    await Promise.all(
      changed
        .filter((project) => project.isSync)
        .map((project) =>
          projectService.update(user.uid, project.id, {
            order: orderedProjects.indexOf(project),
          })
        )
    );
  };

  const togglePin = (project: Project) => updateProject(project.id, { pinned: !project.pinned });

  const selectProject = (id: string | null) => setActiveProject(id);

  const toggleProject = (id: string) =>
    setActiveProject(useProjectsStore.getState().activeProjectId === id ? null : id);

  const loadProjects = async (userId: string) => {
    await projectService.syncProjects(userId);
    const remoteProjects = await projectService.getProjects(userId);

    const localOnly = useProjectsStore
      .getState()
      .projects.filter(
        (project) => !project.isSync && !remoteProjects.some((remote) => remote.id === project.id)
      );

    setProjects(
      [...remoteProjects, ...localOnly].map((project, index) => ({ ...project, order: index }))
    );
  };

  const wipeProjects = async () => {
    setProjects(useProjectsStore.getState().projects.filter((project) => !project.isSync));
  };

  return {
    addProject,
    updateProject,
    removeProject,
    togglePin,
    reorderProjects,
    selectProject,
    toggleProject,
    loadProjects,
    wipeProjects,
  };
}
