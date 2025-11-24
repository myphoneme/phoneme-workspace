import { api } from './client';
import type { Comment, CreateCommentInput } from '../types';

export const commentsApi = {
  getByTodoId: (todoId: number) => api.get<Comment[]>(`/comments/todo/${todoId}`),
  create: (data: CreateCommentInput) => api.post<Comment>('/comments', data),
  delete: (id: number) => api.delete(`/comments/${id}`),
};
