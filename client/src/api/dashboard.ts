import { api } from './client';
import type { Todo } from '../types';

export interface ProjectStats {
  id: number;
  name: string;
  icon: string | null;
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  performance: number;
}

export interface UserStats {
  id: number;
  name: string;
  email: string;
  profilePhoto: string | null;
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  performance: number;
}

export interface DashboardStats {
  overall: {
    total: number;
    completed: number;
    incomplete: number;
    overdue: number;
    performance: number;
  };
  projects: ProjectStats[];
  users: UserStats[];
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getProjectPendingTasks: (projectId: number) => api.get<Todo[]>(`/dashboard/projects/${projectId}/pending`),
  getUserPendingTasks: (userId: number) => api.get<Todo[]>(`/dashboard/users/${userId}/pending`),
};
