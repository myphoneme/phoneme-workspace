import { useState } from 'react';
import type { Todo } from '../types';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { useActiveUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { Comments } from './Comments';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [assigneeId, setAssigneeId] = useState(todo.assigneeId);
  const [projectId, setProjectId] = useState(todo.projectId);

  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const { data: users } = useActiveUsers();
  const { data: projects } = useProjects();

  // Check if current user can edit this task
  const isOwner = user?.id === todo.assignerId;
  const isAssignee = user?.id === todo.assigneeId;
  const canEdit = isAdmin || isOwner || isAssignee;
  const canDelete = isAdmin || isOwner;

  const handleToggleComplete = () => {
    if (!canEdit) return;
    updateTodo.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  const handleSave = () => {
    updateTodo.mutate(
      {
        id: todo.id,
        data: { title, description, assigneeId, projectId },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description);
    setAssigneeId(todo.assigneeId);
    setProjectId(todo.projectId);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTodo.mutate(todo.id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {isEditing ? (
        <div className="space-y-3">
          {isAdmin && !isOwner && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block mb-2">
              Editing as Admin
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {users?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
              ))}
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                disabled={!canEdit}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <h3
                  className={`text-xl font-semibold ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {todo.title}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {todo.projectIcon ? `${todo.projectIcon} ` : ''}
                    {todo.projectName}
                  </span>
                </div>
                <p
                  className={`text-gray-600 mt-1 ${
                    todo.completed ? 'line-through' : ''
                  }`}
                >
                  {todo.description}
                </p>
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span>
              <strong>Assigned by:</strong> {todo.assignerName}
              {user?.id === todo.assignerId && (
                <span className="ml-1 text-xs text-blue-600">(you)</span>
              )}
            </span>
            <span>
              <strong>Assigned to:</strong> {todo.assigneeName}
              {user?.id === todo.assigneeId && (
                <span className="ml-1 text-xs text-green-600">(you)</span>
              )}
            </span>
            <span>
              <strong>Created:</strong> {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="border-t pt-3">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showComments ? 'Hide Comments' : 'Show Comments'}
            </button>

            {showComments && <Comments todoId={todo.id} />}
          </div>
        </>
      )}
    </div>
  );
};
