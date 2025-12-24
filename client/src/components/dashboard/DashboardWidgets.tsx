import { useState, useMemo } from 'react';
import { useDashboardStats, useProjectPendingTasks, useUserPendingTasks } from '../../hooks/useDashboard';
import { useTodos } from '../../hooks/useTodos';
import { getProjectInitials, getProjectColor } from '../../utils/projectUtils';
import type { Todo } from '../../types';

type ViewMode = 'projects' | 'users';

export function DashboardWidgets() {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stats, isLoading } = useDashboardStats();
  const { data: allTodos } = useTodos();
  const { data: projectPendingTasks } = useProjectPendingTasks(selectedProject);
  const { data: userPendingTasks } = useUserPendingTasks(selectedUser);

  // Get tasks based on selection and filters
  const filteredTasks = useMemo(() => {
    let tasks: Todo[] = [];

    if (selectedProject && projectPendingTasks) {
      tasks = [...projectPendingTasks];
      if (statusFilter !== 'pending' && allTodos) {
        tasks = allTodos.filter(t => t.projectId === selectedProject);
      }
    } else if (selectedUser && userPendingTasks) {
      tasks = [...userPendingTasks];
      if (statusFilter !== 'pending' && allTodos) {
        tasks = allTodos.filter(t => t.assigneeId === selectedUser);
      }
    } else if (allTodos) {
      tasks = [...allTodos];
    }

    // Apply status filter
    const now = Date.now();
    if (statusFilter === 'pending') {
      tasks = tasks.filter(t => !t.completed);
    } else if (statusFilter === 'completed') {
      tasks = tasks.filter(t => t.completed);
    } else if (statusFilter === 'overdue') {
      tasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).getTime() < now);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      tasks = tasks.filter(t => t.priority === priorityFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.assigneeName.toLowerCase().includes(query) ||
        t.assignerName.toLowerCase().includes(query) ||
        t.projectName.toLowerCase().includes(query)
      );
    }

    return tasks;
  }, [selectedProject, selectedUser, projectPendingTasks, userPendingTasks, allTodos, priorityFilter, statusFilter, searchQuery]);

  // Group tasks by project
  const tasksByProject = useMemo(() => {
    const grouped = new Map<number, {
      projectId: number;
      projectName: string;
      projectDescription?: string;
      projectIcon?: string;
      tasks: Todo[];
      completedCount: number;
      overdueCount: number;
    }>();

    filteredTasks.forEach(task => {
      if (!grouped.has(task.projectId)) {
        grouped.set(task.projectId, {
          projectId: task.projectId,
          projectName: task.projectName,
          projectDescription: task.projectDescription,
          projectIcon: task.projectIcon,
          tasks: [],
          completedCount: 0,
          overdueCount: 0,
        });
      }
      const project = grouped.get(task.projectId)!;
      project.tasks.push(task);
      if (task.completed) project.completedCount++;
      if (!task.completed && task.dueDate && new Date(task.dueDate).getTime() < Date.now()) {
        project.overdueCount++;
      }
    });

    grouped.forEach(project => {
      project.tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    });

    return Array.from(grouped.values()).sort((a, b) => b.tasks.length - a.tasks.length);
  }, [filteredTasks]);

  // Group tasks by user
  const tasksByUser = useMemo(() => {
    const grouped = new Map<number, {
      userId: number;
      userName: string;
      userEmail: string;
      tasks: Todo[];
      completedCount: number;
      overdueCount: number;
    }>();

    filteredTasks.forEach(task => {
      if (!grouped.has(task.assigneeId)) {
        grouped.set(task.assigneeId, {
          userId: task.assigneeId,
          userName: task.assigneeName,
          userEmail: task.assigneeEmail,
          tasks: [],
          completedCount: 0,
          overdueCount: 0,
        });
      }
      const user = grouped.get(task.assigneeId)!;
      user.tasks.push(task);
      if (task.completed) user.completedCount++;
      if (!task.completed && task.dueDate && new Date(task.dueDate).getTime() < Date.now()) {
        user.overdueCount++;
      }
    });

    grouped.forEach(user => {
      user.tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    });

    return Array.from(grouped.values()).sort((a, b) => b.tasks.length - a.tasks.length);
  }, [filteredTasks]);

  // Filter projects/users by search
  const filteredProjects = useMemo(() => {
    if (!stats?.projects) return [];
    if (!searchQuery.trim()) return stats.projects;
    const query = searchQuery.toLowerCase();
    return stats.projects.filter(p => p.name.toLowerCase().includes(query));
  }, [stats?.projects, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!stats?.users) return [];
    if (!searchQuery.trim()) return stats.users;
    const query = searchQuery.toLowerCase();
    return stats.users.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  }, [stats?.users, searchQuery]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProject(value ? Number(value) : null);
    setSelectedUser(null);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUser(value ? Number(value) : null);
    setSelectedProject(null);
  };

  const clearFilters = () => {
    setSelectedProject(null);
    setSelectedUser(null);
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('pending');
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) return null;

  const selectedProjectData = selectedProject ? stats.projects.find(p => p.id === selectedProject) : null;
  const selectedUserData = selectedUser ? stats.users.find(u => u.id === selectedUser) : null;
  const currentStats = selectedProjectData || selectedUserData || stats.overall;
  const statusLabels = { all: 'All Tasks', pending: 'Pending', completed: 'Completed', overdue: 'Overdue' };
  const hasActiveFilters = selectedProject || selectedUser || searchQuery || priorityFilter !== 'all' || statusFilter !== 'pending';

  return (
    <div className="space-y-5">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<ClipboardIcon />} label="Total Tasks" value={currentStats.total} color="blue" />
        <StatCard icon={<CheckCircleIcon />} label="Completed" value={currentStats.completed} color="emerald" />
        <StatCard icon={<ClockIcon />} label="Pending" value={currentStats.incomplete} color="amber" />
        <StatCard icon={<AlertIcon />} label="Overdue" value={currentStats.overdue} color="red" />
        <StatCard
          icon={<TrendingUpIcon />}
          label="Performance"
          value={`${currentStats.performance}%`}
          color={currentStats.performance >= 70 ? 'emerald' : currentStats.performance >= 40 ? 'amber' : 'red'}
        />
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setViewMode('projects'); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'projects' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderIcon />
              Projects
            </button>
            <button
              onClick={() => { setViewMode('users'); setSelectedProject(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'users' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UsersIcon />
              Users
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${viewMode === 'projects' ? 'projects' : 'users'}, tasks...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XIcon />
              </button>
            )}
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'projects' ? (
              <select value={selectedProject || ''} onChange={handleProjectChange} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="">All Projects</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.total})</option>)}
              </select>
            ) : (
              <select value={selectedUser || ''} onChange={handleUserChange} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
                <option value="">All Users</option>
                {filteredUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.total})</option>)}
              </select>
            )}

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors">
                <XIcon /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{statusLabels[statusFilter]}</h2>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        {(selectedProjectData || selectedUserData) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Filtered by:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">
              {selectedProjectData?.name || selectedUserData?.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredTasks.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : viewMode === 'projects' ? (
        <ProjectsView projects={tasksByProject} />
      ) : (
        <UsersView users={tasksByUser} />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  const colorClass = colors[color as keyof typeof colors] || colors.blue;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${colorClass}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// Projects View
function ProjectsView({ projects }: { projects: Array<{ projectId: number; projectName: string; projectDescription?: string; projectIcon?: string; tasks: Todo[]; completedCount: number; overdueCount: number }> }) {
  return (
    <div className="space-y-6">
      {projects.map(project => (
        <div key={project.projectId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Project Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className={`w-12 h-12 rounded-xl ${getProjectColor(project.projectId)} text-white flex items-center justify-center text-lg font-bold shadow-md`}>
              {getProjectInitials(project.projectName)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900">{project.projectName}</h3>
              {project.projectDescription && (
                <p className="text-sm text-gray-600 truncate">{project.projectDescription}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-3">
                <p className="text-lg font-bold text-gray-900">{project.tasks.length}</p>
                <p className="text-xs text-gray-500">Tasks</p>
              </div>
              <div className="text-center px-3 border-l border-orange-200">
                <p className="text-lg font-bold text-emerald-600">{project.completedCount}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
              {project.overdueCount > 0 && (
                <div className="text-center px-3 border-l border-orange-200">
                  <p className="text-lg font-bold text-red-600">{project.overdueCount}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {project.tasks.map(task => (
                <TaskCard key={task.id} task={task} showProject={false} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Users View
function UsersView({ users }: { users: Array<{ userId: number; userName: string; userEmail: string; tasks: Todo[]; completedCount: number; overdueCount: number }> }) {
  return (
    <div className="space-y-6">
      {users.map(user => (
        <div key={user.userId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* User Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
              {getInitials(user.userName)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900">{user.userName}</h3>
              <p className="text-sm text-gray-500">{user.userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-3">
                <p className="text-lg font-bold text-gray-900">{user.tasks.length}</p>
                <p className="text-xs text-gray-500">Tasks</p>
              </div>
              <div className="text-center px-3 border-l border-blue-200">
                <p className="text-lg font-bold text-emerald-600">{user.completedCount}</p>
                <p className="text-xs text-gray-500">Done</p>
              </div>
              {user.overdueCount > 0 && (
                <div className="text-center px-3 border-l border-blue-200">
                  <p className="text-lg font-bold text-red-600">{user.overdueCount}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              )}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {user.tasks.map(task => (
                <TaskCard key={task.id} task={task} showProject={true} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Task Card
function TaskCard({ task, showProject = true }: { task: Todo; showProject?: boolean }) {
  const timeStatus = getTimeStatus(task.dueDate);
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all ${task.completed ? 'opacity-70' : ''}`}>
      <div className={`h-1.5 ${priorityConfig.barColor}`} />
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-sm font-semibold text-gray-900 leading-snug ${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {task.isFavorite && <StarIcon className="w-4 h-4 text-amber-400 fill-amber-400" />}
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${priorityConfig.badgeColor}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
        )}

        {/* Project Info */}
        {showProject && (
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
            <div className={`w-7 h-7 rounded-lg ${getProjectColor(task.projectId)} text-white flex items-center justify-center text-xs font-bold`}>
              {getProjectInitials(task.projectName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{task.projectName}</p>
            </div>
          </div>
        )}

        {/* Dates Row */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-gray-500">
            <ClockIcon className="w-3.5 h-3.5" />
            Created: {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${
              !task.completed && new Date(task.dueDate).getTime() < Date.now()
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
            }`}>
              <CalendarIcon className="w-3.5 h-3.5" />
              Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' '}
              {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium px-2 py-0.5 rounded ${timeStatus.className}`}>
            {timeStatus.label}
          </span>
          {task.completed && (
            <span className="text-sm px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Completed</span>
          )}
        </div>

        {/* People */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-gray-400">From:</span>
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {getInitials(task.assignerName)}
            </div>
            <span className="text-sm text-gray-700 truncate">{task.assignerName}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs text-gray-400">To:</span>
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-700">
              {getInitials(task.assigneeName)}
            </div>
            <span className="text-sm text-gray-900 font-medium truncate">{task.assigneeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ statusFilter }: { statusFilter: string }) {
  const messages = {
    all: 'No tasks found',
    pending: 'No pending tasks',
    completed: 'No completed tasks',
    overdue: 'No overdue tasks',
  };
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <ClipboardIcon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-600 font-medium text-lg">{messages[statusFilter as keyof typeof messages] || 'No tasks found'}</p>
      <p className="text-gray-400 mt-1">Try adjusting your filters</p>
    </div>
  );
}

// Helper functions
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getTimeStatus(dueDate?: string): { label: string; className: string } {
  if (!dueDate) return { label: 'No due date', className: 'text-gray-600 bg-gray-100' };
  const diff = new Date(dueDate).getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: `${Math.abs(days)}d overdue`, className: 'text-red-700 bg-red-100' };
  if (days === 0) return { label: 'Due today', className: 'text-orange-700 bg-orange-100' };
  if (days === 1) return { label: 'Tomorrow', className: 'text-amber-700 bg-amber-100' };
  if (days <= 7) return { label: `${days} days left`, className: 'text-blue-700 bg-blue-100' };
  return { label: `${days} days left`, className: 'text-emerald-700 bg-emerald-100' };
}

function getPriorityConfig(priority: 'high' | 'medium' | 'low'): { barColor: string; badgeColor: string } {
  const configs = {
    high: { barColor: 'bg-red-500', badgeColor: 'bg-red-100 text-red-700' },
    medium: { barColor: 'bg-amber-500', badgeColor: 'bg-amber-100 text-amber-700' },
    low: { barColor: 'bg-blue-500', badgeColor: 'bg-blue-100 text-blue-700' },
  };
  return configs[priority];
}

// Icons
function ClipboardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
}
function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function ClockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function AlertIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}
function TrendingUpIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
}
function FolderIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
}
function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function StarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
}
