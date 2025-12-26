import { useState } from 'react';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import { useSetting, useUpdateSetting } from '../hooks/useSettings';
import { useProjects, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import { useTodos, useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { useWorkspaceSyncAction, useWorkspaceSyncStatus } from '../hooks/useWorkspaceSync';
import type { User, Project, Todo, UpdateTodoInput } from '../types';
import type { FormEvent } from 'react';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'tasks' | 'settings'>('users');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage users and settings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6 text-white">
                <path
                  fill="currentColor"
                  d="M20 4C11.16 4 4 11.16 4 20c0 3.09.88 5.97 2.4 8.4L4 36l7.6-2.4C14.03 35.12 16.91 36 20 36c8.84 0 16-7.16 16-16S28.84 4 20 4zm-2 22v-8h8v-4h-8V8h4v6h8v8h-8v4h-4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Domain Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' ? (
              <UsersTab />
            ) : activeTab === 'projects' ? (
              <ProjectsTab />
            ) : activeTab === 'tasks' ? (
              <TasksTab />
            ) : (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const { data: syncStatus, isError } = useWorkspaceSyncStatus();
  const syncWorkspace = useWorkspaceSyncAction();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleRoleChange = async (user: User, newRole: 'admin' | 'user') => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { role: newRole },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { isActive: !user.isActive },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleUpdateName = async (user: User, newName: string) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { name: newName },
      });
      setEditingUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update name');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">Google Workspace</p>
              <h3 className="text-lg font-semibold text-gray-900">Sync users from Workspace</h3>
              <p className="text-sm text-gray-600 mt-1">
                Import and refresh all users from the Phoneme Google Workspace. We will update names/photos and keep
                accounts active.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-orange-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  Last sync:{' '}
                  {syncStatus?.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleString() : 'Not synced yet'}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
                  </svg>
                  {syncStatus?.syncedCount ?? 0} users seen
                </span>
                {(syncStatus?.importedCount || syncStatus?.updatedCount) && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-100 text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {syncStatus?.importedCount ?? 0} new / {syncStatus?.updatedCount ?? 0} updated
                  </span>
                )}
              </div>
              {syncStatus?.sampleUsers?.length ? (
                <div className="mt-3 text-xs text-gray-600">
                  Last synced users:{' '}
                  <span className="font-medium text-gray-800">{syncStatus.sampleUsers.join(', ')}</span>
                </div>
              ) : null}
              {isError && (
                <p className="mt-2 text-sm text-red-600">
                  Workspace sync status unavailable. Ensure service account env vars are set.
                </p>
              )}
            </div>
            <button
              onClick={() => syncWorkspace.mutate()}
              disabled={syncWorkspace.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md shadow hover:bg-orange-600 disabled:opacity-60"
            >
              {syncWorkspace.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v2.5a5.5 5.5 0 00-5.5 5.5H4z"
                    />
                  </svg>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0a4 4 0 100 8h0a4 4 0 000-8m0 0V4" />
                  </svg>
                  Sync Workspace
                </>
              )}
            </button>
          </div>
          {syncWorkspace.isError && (
            <p className="mt-3 text-sm text-red-600">
              {syncWorkspace.error instanceof Error ? syncWorkspace.error.message : 'Failed to sync workspace.'}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          Users are automatically created when they sign in with Google.
          Manage their roles and access here.
        </p>
      </div>

      {users?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600">No users yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Users will appear here after they sign in with Google for the first time.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users?.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        {editingUser?.id === user.id ? (
                          <input
                            type="text"
                            defaultValue={user.name}
                            onBlur={(e) => handleUpdateName(user, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateName(user, e.currentTarget.value);
                              } else if (e.key === 'Escape') {
                                setEditingUser(null);
                              }
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            autoFocus
                          />
                        ) : (
                          <p
                            className="font-medium text-gray-900 cursor-pointer hover:text-orange-600"
                            onClick={() => setEditingUser(user)}
                            title="Click to edit name"
                          >
                            {user.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'user')}
                      className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer border-0 ${
                        user.role === 'admin'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      disabled={updateUser.isPending}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(user)}
                      disabled={updateUser.isPending}
                      className={`text-sm font-medium ${
                        user.isActive
                          ? 'text-yellow-600 hover:text-yellow-800'
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [newProject, setNewProject] = useState({ name: '', description: '', icon: '' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editValues, setEditValues] = useState({ name: '', description: '', icon: '' });

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      alert('Project name is required');
      return;
    }
    createProject.mutate(
      {
        name: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        icon: newProject.icon.trim() || undefined,
      },
      {
        onSuccess: () => setNewProject({ name: '', description: '', icon: '' }),
      }
    );
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    setEditValues({
      name: project.name,
      description: project.description || '',
      icon: project.icon || '',
    });
  };

  const handleUpdate = (projectId: number) => {
    updateProject.mutate(
      {
        id: projectId,
        data: {
          name: editValues.name.trim(),
          description: editValues.description.trim() || undefined,
          icon: editValues.icon.trim() || undefined,
        },
      },
      { onSuccess: () => setEditingProject(null) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Project Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          Organize tasks under Projects. &quot;Office Tasks&quot; is the default workspace for general work.
        </p>
      </div>

      <form onSubmit={handleCreate} className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g., Website Redesign"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="w-full md:w-52">
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji or short label)</label>
            <input
              type="text"
              value={newProject.icon}
              onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
              placeholder="🚀"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="What is this project about?"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows={2}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createProject.isPending}
            className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {createProject.isPending ? 'Saving...' : 'Add Project'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {projects?.length === 0 ? (
          <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl text-gray-500">
            No projects yet. Create one above.
          </div>
        ) : (
          projects?.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-xl bg-white p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">
                  {project.icon || '📁'}
                </div>
                <div>
                  <p className="text-sm text-gray-400">Project #{project.id}</p>
                  {editingProject?.id === project.id ? (
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {project.name}
                      {project.name === 'Office Tasks' && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Default</span>
                      )}
                    </h3>
                  )}
                  {editingProject?.id === project.id ? (
                    <textarea
                      value={editValues.description}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      className="mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description || 'No description provided'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {editingProject?.id === project.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(project.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      disabled={updateProject.isPending}
                    >
                      {updateProject.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(project)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TasksTab() {
  const { data: todos, isLoading } = useTodos();
  const { data: users } = useUsers();
  const { data: projects } = useProjects();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [editValues, setEditValues] = useState<UpdateTodoInput>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');

  const filteredTodos = todos?.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.assignerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && todo.completed) ||
      (filterStatus === 'pending' && !todo.completed);
    return matchesSearch && matchesStatus;
  });

  const startEdit = (task: Todo) => {
    setEditingTask(task);
    setEditValues({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      projectId: task.projectId,
      priority: task.priority,
      completed: task.completed,
      dueDate: task.dueDate || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    try {
      await updateTodo.mutateAsync({ id: editingTask.id, data: editValues });
      setEditingTask(null);
      setEditValues({});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTodo.mutateAsync(taskId);
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          View, edit, and delete all tasks. Use this to clean up mistakenly created tasks.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks by title, description, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Tasks ({todos?.length || 0})</option>
          <option value="pending">Pending ({todos?.filter((t) => !t.completed).length || 0})</option>
          <option value="completed">Completed ({todos?.filter((t) => t.completed).length || 0})</option>
        </select>
      </div>

      {/* Task List */}
      {filteredTodos?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600">No tasks found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try adjusting your search query' : 'No tasks have been created yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Task</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Assigner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Assignee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Project</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTodos?.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{task.assignerName}</p>
                    <p className="text-xs text-gray-500">{task.assignerEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">{task.assigneeName}</p>
                    <p className="text-xs text-gray-500">{task.assigneeEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                      {task.projectIcon && <span>{task.projectIcon}</span>}
                      {task.projectName}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        task.completed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(task)}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(task.id)}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <p className="text-sm text-gray-500 mt-1">Task #{editingTask.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editValues.title || ''}
                  onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editValues.description || ''}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={editValues.assigneeId || ''}
                    onChange={(e) => setEditValues({ ...editValues, assigneeId: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {users?.filter((u) => u.isActive).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={editValues.projectId || ''}
                    onChange={(e) => setEditValues({ ...editValues, projectId: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.icon} {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editValues.priority || 'medium'}
                    onChange={(e) => setEditValues({ ...editValues, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editValues.dueDate || ''}
                    onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editValues.completed || false}
                    onChange={(e) => setEditValues({ ...editValues, completed: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Mark as completed</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingTask(null);
                  setEditValues({});
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateTodo.isPending}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {updateTodo.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Task?</h3>
              <p className="text-gray-600 text-center text-sm mb-6">
                This will permanently delete this task and all associated comments. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteTodo.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteTodo.isPending ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { data: domainSetting, isLoading } = useSetting('allowed_domains');
  const updateSetting = useUpdateSetting();

  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (domainSetting && !initialized) {
    setDomains(domainSetting.value || []);
    setInitialized(true);
  }

  const handleAddDomain = () => {
    const domain = newDomain.toLowerCase().trim();
    if (domain && !domains.includes(domain)) {
      setDomains([...domains, domain]);
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setDomains(domains.filter((d) => d !== domain));
  };

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: 'allowed_domains', value: domains });
      alert('Domain settings saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Allowed Email Domains</h2>
      <p className="text-gray-500 text-sm mb-6">
        Only users with email addresses from these domains can sign in with Google.
        Leave empty to allow any Google account.
      </p>

      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
            placeholder="e.g., yourcompany.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={handleAddDomain}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Add Domain
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <span
                key={domain}
                className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full flex items-center gap-2"
              >
                {domain}
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  className="text-orange-500 hover:text-orange-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm italic">
              No domains configured - any Google account can sign in
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {updateSetting.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
