import { api } from './client';
import type { User, CreateUserInput, UpdateUserInput, WorkspaceSyncMetadata } from '../types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),

  getActive: () => api.get<User[]>('/users/active'),

  getById: (id: number) => api.get<User>(`/users/${id}`),

  create: (data: CreateUserInput) => api.post<User>('/users', data),

  update: (id: number, data: UpdateUserInput) => api.put<User>(`/users/${id}`, data),

  delete: (id: number) => api.delete(`/users/${id}`),

  getWorkspaceSync: () => api.get<WorkspaceSyncMetadata>('/users/workspace-sync'),

  syncWorkspace: () => api.post<WorkspaceSyncMetadata>('/users/sync-workspace'),
};
