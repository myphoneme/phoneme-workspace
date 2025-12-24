import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Helper to check if value is truthy (handles PostgreSQL bigint as string)
const isTruthy = (val: any) => val == 1 || val === '1' || val === true;

// Transform database row to frontend format (lowercase to camelCase)
const transformTodo = (todo: any) => ({
  id: todo.id,
  title: todo.title,
  description: todo.description,
  assignerId: todo.assignerid,
  assigneeId: todo.assigneeid,
  projectId: todo.projectid,
  completed: isTruthy(todo.completed),
  priority: todo.priority,
  isFavorite: isTruthy(todo.isfavorite),
  dueDate: todo.duedate,
  createdAt: todo.createdat,
  updatedAt: todo.updatedat,
  assignerName: todo.assignername,
  assignerEmail: todo.assigneremail,
  assigneeName: todo.assigneename,
  assigneeEmail: todo.assigneeemail,
  projectName: todo.projectname,
  projectDescription: todo.projectdescription,
  projectIcon: todo.projecticon,
});

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
  profilephoto: string | null;
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  performance: number;
}

// Get dashboard statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user!.userId;
    const now = new Date().toISOString();

    // Get overall stats
    let overallStats;
    if (isAdmin) {
      overallStats = await db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN completed = 0 AND duedate IS NOT NULL AND duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM todos
      `).get(now) as any;
    } else {
      overallStats = await db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN completed = 0 AND duedate IS NOT NULL AND duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM todos
        WHERE assignerid = ? OR assigneeid = ?
      `).get(now, userId, userId) as any;
    }

    // Get project-wise stats
    let projectStats: ProjectStats[];
    if (isAdmin) {
      projectStats = await db.prepare(`
        SELECT
          p.id,
          p.name,
          p.icon,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.duedate IS NOT NULL AND t.duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM projects p
        LEFT JOIN todos t ON t.projectid = p.id
        GROUP BY p.id
        ORDER BY total DESC
      `).all(now) as any[];
    } else {
      projectStats = await db.prepare(`
        SELECT
          p.id,
          p.name,
          p.icon,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.duedate IS NOT NULL AND t.duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM projects p
        LEFT JOIN todos t ON t.projectid = p.id AND (t.assignerid = ? OR t.assigneeid = ?)
        GROUP BY p.id
        HAVING COUNT(t.id) > 0
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
      userStats = await db.prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.profilephoto,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.duedate IS NOT NULL AND t.duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM users u
        LEFT JOIN todos t ON t.assigneeid = u.id
        WHERE u.isactive = 1
        GROUP BY u.id
        ORDER BY total DESC
      `).all(now) as any[];
    } else {
      // For non-admin users, only show their own stats
      userStats = await db.prepare(`
        SELECT
          u.id,
          u.name,
          u.email,
          u.profilephoto,
          COUNT(t.id) as total,
          SUM(CASE WHEN t.completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN t.completed = 0 THEN 1 ELSE 0 END) as incomplete,
          SUM(CASE WHEN t.completed = 0 AND t.duedate IS NOT NULL AND t.duedate < ? THEN 1 ELSE 0 END) as overdue
        FROM users u
        LEFT JOIN todos t ON t.assigneeid = u.id
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
router.get('/projects/:projectId/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user!.userId;
    const projectId = req.params.projectId;

    const baseQuery = `
      SELECT
        t.*,
        assigner.name as assignername,
        assigner.email as assigneremail,
        assignee.name as assigneename,
        assignee.email as assigneeemail,
        p.name as projectname,
        p.description as projectdescription,
        p.icon as projecticon
      FROM todos t
      JOIN users assigner ON t.assignerid = assigner.id
      JOIN users assignee ON t.assigneeid = assignee.id
      JOIN projects p ON t.projectid = p.id
      WHERE t.projectid = ? AND t.completed = 0
    `;

    const todos = isAdmin
      ? await db.prepare(`${baseQuery} ORDER BY t.duedate ASC, t.priority DESC, t.createdat DESC`).all(projectId)
      : await db.prepare(`${baseQuery} AND (t.assignerid = ? OR t.assigneeid = ?) ORDER BY t.duedate ASC, t.priority DESC, t.createdat DESC`).all(projectId, userId, userId);

    res.json(todos.map(transformTodo));
  } catch (error) {
    console.error('Fetch pending tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

// Get pending tasks for a specific user (assignee)
router.get('/users/:userId/pending', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const currentUserId = req.user!.userId;
    const targetUserId = req.params.userId;

    // Non-admin can only view their own tasks
    if (!isAdmin && Number(targetUserId) !== currentUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const todos = await db.prepare(`
      SELECT
        t.*,
        assigner.name as assignername,
        assigner.email as assigneremail,
        assignee.name as assigneename,
        assignee.email as assigneeemail,
        p.name as projectname,
        p.description as projectdescription,
        p.icon as projecticon
      FROM todos t
      JOIN users assigner ON t.assignerid = assigner.id
      JOIN users assignee ON t.assigneeid = assignee.id
      JOIN projects p ON t.projectid = p.id
      WHERE t.assigneeid = ? AND t.completed = 0
      ORDER BY t.duedate ASC, t.priority DESC, t.createdat DESC
    `).all(targetUserId) as any[];

    res.json(todos.map(transformTodo));
  } catch (error) {
    console.error('Fetch user pending tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

export default router;
