import { api } from './client';
import type { User } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),

  googleLogin: (credential: string) =>
    api.post<{ user: User }>('/auth/google', { credential }),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  getCurrentUser: () => api.get<{ user: User }>('/auth/me'),
};
