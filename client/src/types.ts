export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isActive?: boolean;
  profilePhoto?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'task_assigned' | 'task_completed' | 'comment_added' | 'mention' | 'system';
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  assignerId: number;
  assigneeId: number;
  assignerName: string;
  assignerEmail: string;
  assigneeName: string;
  assigneeEmail: string;
  projectId: number;
  projectName: string;
  projectDescription?: string;
  projectIcon?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  isFavorite: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  todoId: number;
  authorId: number;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface CreateTodoInput {
  title: string;
  description: string;
  assigneeId: number;
  projectId: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  assigneeId?: number;
  projectId?: number;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  isFavorite?: boolean;
  dueDate?: string;
}

export interface CreateCommentInput {
  todoId: number;
  content: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface Setting {
  key: string;
  value: any;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  icon?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

export interface WorkspaceSyncMetadata {
  lastSyncedAt: string | null;
  syncedCount: number;
  importedCount: number;
  updatedCount: number;
  sampleUsers: string[];
}
