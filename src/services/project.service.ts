import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Project } from '@/interfaces/Project.interface';
import { PROJECT_DEFAULT_COLOR, PROJECTS_STORAGE_KEY } from '@/constants/Projects';
import { readLocalJSON } from '@/utils/storage.utils';

const toDocument = (project: Project) => ({
  name: project.name,
  description: project.description ?? '',
  color: project.color,
  order: project.order,
  pinned: project.pinned ?? false,
});

const toProject = (id: string, data: Record<string, unknown>): Project => ({
  id,
  name: (data.name as string) ?? '',
  description: (data.description as string) ?? '',
  color: (data.color as Project['color']) ?? PROJECT_DEFAULT_COLOR,
  order: (data.order as number) ?? 0,
  pinned: (data.pinned as boolean) ?? false,
  isSync: true,
});

export const projectService = {
  async create(project: Project, userId: string) {
    await setDoc(doc(db, 'users', userId, 'projects', project.id), {
      ...toDocument(project),
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async update(userId: string, projectId: string, updates: Partial<Project>) {
    const payload: Record<string, unknown> = { updatedAt: Timestamp.now() };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.order !== undefined) payload.order = updates.order;
    if (updates.pinned !== undefined) payload.pinned = updates.pinned;

    await updateDoc(doc(db, 'users', userId, 'projects', projectId), payload);
  },

  async delete(userId: string, projectId: string) {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  },

  async getProjects(userId: string): Promise<Project[]> {
    const projectsQuery = query(
      collection(db, 'users', userId, 'projects'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(projectsQuery);

    return snapshot.docs.map((snap) => toProject(snap.id, snap.data()));
  },

  async syncProjects(userId: string) {
    const stored = readLocalJSON<{ state?: { projects?: Project[] } }>(PROJECTS_STORAGE_KEY);
    const pendingProjects = (stored?.state?.projects ?? []).filter((project) => !project.isSync);

    for (const project of pendingProjects) {
      await this.create(project, userId);
    }
  },
};
