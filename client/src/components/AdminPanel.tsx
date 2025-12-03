import { useState, FormEvent } from 'react';
import { useUsers, useUpdateUser } from '../hooks/useUsers';
import { useSetting, useUpdateSetting } from '../hooks/useSettings';
import { useProjects, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import type { User, Project } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'settings'>('users');

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
            {activeTab === 'users' ? <UsersTab /> : activeTab === 'projects' ? <ProjectsTab /> : <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
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
