import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { WorkspaceSyncMetadata } from '../types';

export const useWorkspaceSyncStatus = () => {
  return useQuery<WorkspaceSyncMetadata>({
    queryKey: ['workspaceSync'],
    queryFn: usersApi.getWorkspaceSync,
  });
};

export const useWorkspaceSyncAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.syncWorkspace,
    onSuccess: (data) => {
      queryClient.setQueryData(['workspaceSync'], data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
