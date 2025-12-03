import { api } from './client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types';

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  create: (data: CreateProjectInput) => api.post<Project>('/projects', data),
  update: (id: number, data: UpdateProjectInput) => api.put<Project>(`/projects/${id}`, data),
};
