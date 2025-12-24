import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });
};

export const useProjectPendingTasks = (projectId: number | null) => {
  return useQuery({
    queryKey: ['dashboard', 'projects', projectId, 'pending'],
    queryFn: () => dashboardApi.getProjectPendingTasks(projectId!),
    enabled: projectId !== null,
  });
};

export const useUserPendingTasks = (userId: number | null) => {
  return useQuery({
    queryKey: ['dashboard', 'users', userId, 'pending'],
    queryFn: () => dashboardApi.getUserPendingTasks(userId!),
    enabled: userId !== null,
  });
};
