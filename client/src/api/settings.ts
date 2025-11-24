import { api } from './client';
import type { Setting } from '../types';

export const settingsApi = {
  getAll: () => api.get<Setting[]>('/settings'),

  get: (key: string) => api.get<Setting>(`/settings/${key}`),

  update: (key: string, value: any) => api.put<Setting>(`/settings/${key}`, { value }),
};
