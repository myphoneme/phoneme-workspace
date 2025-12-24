import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

interface ProjectStats {
  id: number;
  name: string;
  icon: string | null;
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  performance: number;
}

interface UserStats {
  id: number;
  name: string;
  email: string;
  profilePhoto: string | null;
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  performance: number;
}

// Get dashboard statistics
router.get('/stats', (req: Request, res: Response): void => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user!.userId;
    const now = new Date().toISOString();

    // Get overall stats
    let overallStats;
    if (isAdmin) {
      overallStats = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN completed = 0 AND dueDate IS NOT NULL AND dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM todos
      `).get(now) as any;
    } else {
      overallStats = db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN completed = 0 AND dueDate IS NOT NULL AND dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM todos
        WHERE assignerId = ? OR assigneeId = ?
      `).get(now, userId, userId) as any;
    }

    // Get project-wise stats
    let projectStats: ProjectStats[];
    if (isAdmin) {
      projectStats = db.prepare(`
        SELECT
          p.id,
          p.name,
          p.icon,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.dueDate IS NOT NULL AND t.dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM projects p
        LEFT JOIN todos t ON t.projectId = p.id
        GROUP BY p.id
        ORDER BY total DESC
      `).all(now) as any[];
    } else {
      projectStats = db.prepare(`
        SELECT
          p.id,
          p.name,
          p.icon,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.dueDate IS NOT NULL AND t.dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM projects p
        LEFT JOIN todos t ON t.projectId = p.id AND (t.assignerId = ? OR t.assigneeId = ?)
        GROUP BY p.id
        HAVING total > 0
        ORDER BY total DESC
      `).all(now, userId, userId) as any[];
    }

    // Calculate performance for each project
    projectStats = projectStats.map(p => ({
      ...p,
      total: Number(p.total) || 0,
      completed: Number(p.completed) || 0,
      incomplete: Number(p.incomplete) || 0,
      overdue: Number(p.overdue) || 0,
      performance: p.total > 0 ? Math.round((Number(p.completed) / Number(p.total)) * 100) : 0
    }));

    // Get user-wise stats
    let userStats: UserStats[];
    if (isAdmin) {
      userStats = db.prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.profilePhoto,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.dueDate IS NOT NULL AND t.dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM users u
        LEFT JOIN todos t ON t.assigneeId = u.id
        WHERE u.isActive = 1
        GROUP BY u.id
        ORDER BY total DESC
      `).all(now) as any[];
    } else {
      // For non-admin users, only show their own stats
      userStats = db.prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.profilePhoto,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.dueDate IS NOT NULL AND t.dueDate < ? THEN 1 ELSE 0 END) as overdue
        FROM users u
        LEFT JOIN todos t ON t.assigneeId = u.id
        WHERE u.id = ?
        GROUP BY u.id
      `).all(now, userId) as any[];
    }

    // Calculate performance for each user
    userStats = userStats.map(u => ({
      ...u,
      total: Number(u.total) || 0,
      completed: Number(u.completed) || 0,
      incomplete: Number(u.incomplete) || 0,
      overdue: Number(u.overdue) || 0,
      performance: u.total > 0 ? Math.round((Number(u.completed) / Number(u.total)) * 100) : 0
    }));

    res.json({
      overall: {
        total: Number(overallStats.total) || 0,
        completed: Number(overallStats.completed) || 0,
        incomplete: Number(overallStats.incomplete) || 0,
        overdue: Number(overallStats.overdue) || 0,
        performance: overallStats.total > 0
          ? Math.round((Number(overallStats.completed) / Number(overallStats.total)) * 100)
          : 0
      },
      projects: projectStats,
      users: userStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get pending tasks for a specific project
router.get('/projects/:projectId/pending', (req: Request, res: Response): void => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user!.userId;
    const projectId = req.params.projectId;

    const baseQuery = `
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail,
        p.name as projectName,
        p.description as projectDescription,
        p.icon as projectIcon
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      JOIN projects p ON t.projectId = p.id
      WHERE t.projectId = ? AND t.completed = 0
    `;

    const todos = isAdmin
      ? db.prepare(`${baseQuery} ORDER BY t.dueDate ASC, t.priority DESC, t.createdAt DESC`).all(projectId) as any[]
      : db.prepare(`${baseQuery} AND (t.assignerId = ? OR t.assigneeId = ?) ORDER BY t.dueDate ASC, t.priority DESC, t.createdAt DESC`).all(projectId, userId, userId) as any[];

    const formattedTodos = todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed),
      isFavorite: Boolean(todo.isFavorite),
    }));

    res.json(formattedTodos);
  } catch (error) {
    console.error('Fetch pending tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

// Get pending tasks for a specific user (assignee)
router.get('/users/:userId/pending', (req: Request, res: Response): void => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const currentUserId = req.user!.userId;
    const targetUserId = req.params.userId;

    // Non-admin can only view their own tasks
    if (!isAdmin && Number(targetUserId) !== currentUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const todos = db.prepare(`
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail,
        p.name as projectName,
        p.description as projectDescription,
        p.icon as projectIcon
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      JOIN projects p ON t.projectId = p.id
      WHERE t.assigneeId = ? AND t.completed = 0
      ORDER BY t.dueDate ASC, t.priority DESC, t.createdAt DESC
    `).all(targetUserId) as any[];

    const formattedTodos = todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed),
      isFavorite: Boolean(todo.isFavorite),
    }));

    res.json(formattedTodos);
  } catch (error) {
    console.error('Fetch user pending tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

export default router;
