import { useState, useMemo } from 'react';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';

type FilterType = 'all' | 'favorites' | 'assigned' | 'created' | 'completed' | 'pending';
type SortType = 'newest' | 'oldest' | 'priority' | 'title';

export function TaskManager() {
  const { user } = useAuth();
  const { data: todos, isLoading, error } = useTodos();
  const { data: projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectFilter, setProjectFilter] = useState<number | 'all'>('all');

  const filteredAndSortedTodos = useMemo(() => {
    if (!todos) return [];

    let result = [...todos];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description.toLowerCase().includes(query) ||
          todo.assigneeName.toLowerCase().includes(query) ||
          todo.assignerName.toLowerCase().includes(query)
      );
    }

    // Apply project filter
    if (projectFilter !== 'all') {
      result = result.filter((todo) => todo.projectId === projectFilter);
    }

    // Apply category filter
    switch (filter) {
      case 'favorites':
        result = result.filter((todo) => todo.isFavorite);
        break;
      case 'assigned':
        result = result.filter((todo) => todo.assigneeId === user?.id);
        break;
      case 'created':
        result = result.filter((todo) => todo.assignerId === user?.id);
        break;
      case 'completed':
        result = result.filter((todo) => todo.completed);
        break;
      case 'pending':
        result = result.filter((todo) => !todo.completed);
        break;
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [todos, searchQuery, filter, sortBy, user?.id, projectFilter]);

  const stats = useMemo(() => {
    if (!todos) return { total: 0, completed: 0, pending: 0, favorites: 0 };
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed).length,
      favorites: todos.filter((t) => t.isFavorite).length,
    };
  }, [todos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Header for Tasks List */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ListIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tasks List</h1>
                <p className="text-xs text-gray-500">{stats.total} total tasks</p>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>

              {/* Project filter */}
              <select
                value={projectFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setProjectFilter(val === 'all' ? 'all' : Number(val));
                }}
                className="py-2 px-3 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
              >
                <option value="all">All projects</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pb-0 flex items-center justify-between">
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            <FilterTab active={filter === 'all'} onClick={() => setFilter('all')} count={stats.total}>
              All
            </FilterTab>
            <FilterTab active={filter === 'pending'} onClick={() => setFilter('pending')} count={stats.pending}>
              Pending
            </FilterTab>
            <FilterTab active={filter === 'completed'} onClick={() => setFilter('completed')} count={stats.completed}>
              Completed
            </FilterTab>
            <FilterTab active={filter === 'favorites'} onClick={() => setFilter('favorites')} count={stats.favorites}>
              Starred
            </FilterTab>
            <FilterTab active={filter === 'assigned'} onClick={() => setFilter('assigned')}>
              My Tasks
            </FilterTab>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 pb-3">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="text-sm text-gray-700 border-0 bg-transparent focus:ring-0 cursor-pointer font-medium"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </header>

      {/* Task List */}
      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading tasks...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            Error loading tasks. Please make sure the server is running.
          </div>
        ) : filteredAndSortedTodos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EmptyIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTodos.map((todo) => (
              <TaskCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

// Filter Tab Component
interface FilterTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}

function FilterTab({ active, onClick, children, count }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'text-orange-600 border-orange-500'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-1.5 text-xs ${active ? 'text-orange-500' : 'text-gray-400'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}

// Icon Components
function ListIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function EmptyIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function PlusIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
