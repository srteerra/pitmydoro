import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Project } from '@/interfaces/Project.interface';
import { PROJECT_DEFAULT_COLOR, PROJECTS_STORAGE_KEY } from '@/constants/Projects';

interface ProjectsStore {
  projects: Project[];
  activeProjectId: string | null;

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
}

export const createProject = (projects: Project[], isSync = false): Project => ({
  id: `project-${crypto.randomUUID()}`,
  name: '',
  description: '',
  color: PROJECT_DEFAULT_COLOR,
  order: projects.length,
  isSync,
});

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,

      setProjects: (projects) =>
        set((state) => ({
          projects,
          activeProjectId: projects.some((project) => project.id === state.activeProjectId)
            ? state.activeProjectId
            : null,
        })),

      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        })),

      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    {
      name: PROJECTS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
);
