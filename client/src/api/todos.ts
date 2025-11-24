import { api } from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

export const todosApi = {
  getAll: () => api.get<Todo[]>('/todos'),
  getById: (id: number) => api.get<Todo>(`/todos/${id}`),
  create: (data: CreateTodoInput) => api.post<Todo>('/todos', data),
  update: (id: number, data: UpdateTodoInput) => api.put<Todo>(`/todos/${id}`, data),
  delete: (id: number) => api.delete(`/todos/${id}`),
};
