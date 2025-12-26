export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isactive: number | string | boolean;  // PostgreSQL bigint returns as string
  profilephoto?: string;
  lastloginat?: string;
  createdat: string;
  updatedat: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isactive: number | string | boolean;
  profilephoto?: string;
  lastloginat?: string;
  createdat: string;
  updatedat: string;
}

export interface Notification {
  id: number;
  userid: number;
  type: 'task_assigned' | 'task_completed' | 'comment_added' | 'mention' | 'system';
  title: string;
  message: string;
  relatedid?: number;
  isread: number | string | boolean;
  createdat: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  assignerid: number;
  assigneeid: number;
  projectid: number;
  completed: number | string | boolean;
  priority: 'low' | 'medium' | 'high';
  isfavorite: number | string | boolean;
  duedate?: string;
  createdat: string;
  updatedat: string;
}

export interface TodoWithUsers extends Todo {
  assignername: string;
  assigneremail: string;
  assigneename: string;
  assigneeemail: string;
  projectname: string;
  projectdescription?: string;
  projecticon?: string;
}

export interface Comment {
  id: number;
  todoid: number;
  authorid: number;
  content: string;
  createdat: string;
}

export interface CommentWithAuthor extends Comment {
  authorname: string;
  authoremail: string;
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

export interface Project {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  createdat: string;
  updatedat: string;
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

export interface LoginInput {
  email: string;
  password: string;
}

export interface WorkspaceSyncMetadata {
  lastSyncedAt: string | null;
  syncedCount: number;
  importedCount: number;
  updatedCount: number;
  sampleUsers: string[];
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
