import { useState, useEffect, useRef } from 'react';
import { useCreateTodo } from '../hooks/useTodos';
import { useActiveUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Searchable dropdown state
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeInputRef = useRef<HTMLInputElement>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const createTodo = useCreateTodo();
  const { data: users, isLoading: usersLoading } = useActiveUsers();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  // Filter users based on search
  const filteredUsers =
    users?.filter(
      (u: User) =>
        u.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(assigneeSearch.toLowerCase())
    ) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setAssigneeId('');
      setProjectId('');
      setPriority('medium');
      setDueDate('');
      setAssigneeSearch('');
      setIsAssigneeDropdownOpen(false);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && projects && projects.length > 0 && projectId === '') {
      setProjectId(projects[0].id);
    }
  }, [isOpen, projects, projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !assigneeId || !projectId) {
      return;
    }

    createTodo.mutate(
      {
        title,
        description,
        assigneeId: Number(assigneeId),
        projectId: Number(projectId),
        priority,
        dueDate: dueDate || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isAssigneeDropdownOpen) {
        setIsAssigneeDropdownOpen(false);
      } else {
        onClose();
      }
    }
  };

  const handleSelectAssignee = (selectedUser: User) => {
    setAssigneeId(selectedUser.id);
    setAssigneeSearch('');
    setIsAssigneeDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const selectedUser = users?.find((u: User) => u.id === assigneeId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5">
            {/* Title & Description Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                {projectsLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-400 text-sm">
                    <LoadingSpinner className="w-4 h-4" />
                    Loading...
                  </div>
                ) : (
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm resize-none"
                placeholder="Enter task description"
                rows={2}
                required
              />
            </div>

            {/* Assignee, Priority, Due Date Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Assignee */}
              <div ref={assigneeDropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                {usersLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-gray-400 text-sm">
                    <LoadingSpinner className="w-4 h-4" />
                    Loading users...
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md shadow-sm cursor-text transition-colors ${
                        isAssigneeDropdownOpen
                          ? 'border-orange-500 ring-2 ring-orange-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => assigneeInputRef.current?.focus()}
                    >
                      {selectedUser && !assigneeSearch ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-medium text-white">
                            {getInitials(selectedUser.name)}
                          </div>
                          <span className="text-sm text-gray-900 flex-1">{selectedUser.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigneeId('');
                              setAssigneeSearch('');
                            }}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                          >
                            <CloseIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <SearchIcon className="w-4 h-4 text-gray-400" />
                          <input
                            ref={assigneeInputRef}
                            type="text"
                            value={assigneeSearch}
                            onChange={(e) => {
                              setAssigneeSearch(e.target.value);
                              setIsAssigneeDropdownOpen(true);
                            }}
                            onFocus={() => setIsAssigneeDropdownOpen(true)}
                            className="flex-1 text-sm outline-none placeholder-gray-400"
                            placeholder="Search by name or email..."
                          />
                        </>
                      )}
                    </div>

                    {/* Dropdown */}
                    {isAssigneeDropdownOpen && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {assigneeSearch && filteredUsers.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No users found
                          </div>
                        ) : (
                          (assigneeSearch ? filteredUsers : users || []).map((u: User) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectAssignee(u)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                                assigneeId === u.id ? 'bg-orange-50' : ''
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                  assigneeId === u.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                }`}
                              >
                                {getInitials(u.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  {assigneeSearch ? (
                                    <HighlightMatch text={u.name} query={assigneeSearch} />
                                  ) : (
                                    u.name
                                  )}
                                  {u.id === user?.id && (
                                    <span className="ml-1 text-xs text-gray-400">(you)</span>
                                  )}
                                </p>
                              </div>
                              {assigneeId === u.id && <CheckIcon className="w-4 h-4 text-orange-500" />}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex gap-1">
                  {[
                    { value: 'low', label: 'Low', color: 'bg-blue-500' },
                    { value: 'medium', label: 'Med', color: 'bg-yellow-500' },
                    { value: 'high', label: 'High', color: 'bg-red-500' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value as 'low' | 'medium' | 'high')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border text-sm font-medium transition-all ${
                        priority === p.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.color}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTodo.isPending || !title || !description || !assigneeId}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {createTodo.isPending ? (
                  <>
                    <LoadingSpinner className="w-4 h-4" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LoadingSpinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

// Highlight matching text in search results
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 text-yellow-900">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
