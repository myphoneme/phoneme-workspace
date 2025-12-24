import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';
import type { CreateTodoInput, UpdateTodoInput, TodoWithUsers } from '../types';

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

// Get all todos with user details
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'admin';
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
    `;

    const todos = isAdmin
      ? await db.prepare(`${baseQuery} ORDER BY t.createdat DESC`).all()
      : await db.prepare(`${baseQuery} WHERE t.assignerid = ? OR t.assigneeid = ? ORDER BY t.createdat DESC`).all(req.user!.userId, req.user!.userId);

    res.json(todos.map(transformTodo));
  } catch (error) {
    console.error('Fetch todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get single todo by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await db.prepare(`
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
      WHERE t.id = ?
    `).get(req.params.id) as any;

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && todo.assignerid !== req.user!.userId && todo.assigneeid !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(transformTodo(todo));
  } catch (error) {
    console.error('Fetch todo error:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Create new todo
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, assigneeId, priority, dueDate, projectId }: CreateTodoInput = req.body;
    const assignerId = req.user!.userId;
    const normalizedProjectId = projectId !== undefined ? Number(projectId) : undefined;

    if (!title || !description || !assigneeId) {
      res.status(400).json({ error: 'Title, description, and assignee are required' });
      return;
    }

    // Verify assignee exists and is active
    const assignee = await db.prepare('SELECT id FROM users WHERE id = ? AND isactive = 1').get(assigneeId);
    if (!assignee) {
      res.status(400).json({ error: 'Invalid or inactive assignee' });
      return;
    }

    // Validate project
    let targetProjectId = normalizedProjectId;
    if (!targetProjectId) {
      const defaultProject = await db.prepare('SELECT id FROM projects WHERE name = ?').get('Office Tasks') as { id: number } | undefined;
      targetProjectId = defaultProject?.id;
    }
    if (!targetProjectId) {
      res.status(400).json({ error: 'Project is required' });
      return;
    }

    const projectExists = await db.prepare('SELECT id FROM projects WHERE id = ?').get(targetProjectId);
    if (!projectExists) {
      res.status(400).json({ error: 'Invalid project selection' });
      return;
    }

    const result = await db.prepare(`
      INSERT INTO todos (title, description, assignerid, assigneeid, projectid, priority, duedate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, assignerId, assigneeId, targetProjectId, priority || 'medium', dueDate || null);

    const newTodo = await db.prepare(`
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
      WHERE t.id = ?
    `).get(result.lastInsertRowid) as any;

    res.status(201).json(transformTodo(newTodo));
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, assigneeId, completed, priority, isFavorite, dueDate, projectId }: UpdateTodoInput = req.body;
    const todoId = req.params.id;
    const normalizedProjectId = projectId !== undefined ? Number(projectId) : undefined;

    const todo = await db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId) as any;
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && todo.assignerid !== req.user!.userId && todo.assigneeid !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Verify new assignee if provided
    if (assigneeId !== undefined) {
      const assignee = await db.prepare('SELECT id FROM users WHERE id = ? AND isactive = 1').get(assigneeId);
      if (!assignee) {
        res.status(400).json({ error: 'Invalid or inactive assignee' });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (assigneeId !== undefined) {
      updates.push('assigneeid = ?');
      values.push(assigneeId);
    }
    if (normalizedProjectId !== undefined) {
      const projectExists = await db.prepare('SELECT id FROM projects WHERE id = ?').get(normalizedProjectId);
      if (!projectExists) {
        res.status(400).json({ error: 'Invalid project selection' });
        return;
      }
      updates.push('projectid = ?');
      values.push(normalizedProjectId);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (isFavorite !== undefined) {
      updates.push('isfavorite = ?');
      values.push(isFavorite ? 1 : 0);
    }
    if (dueDate !== undefined) {
      updates.push('duedate = ?');
      values.push(dueDate);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push('updatedat = NOW()');
    values.push(todoId);

    await db.prepare(`
      UPDATE todos
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedTodo = await db.prepare(`
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
      WHERE t.id = ?
    `).get(todoId) as any;

    res.json(transformTodo(updatedTodo));
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const todo = await db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as any;
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && todo.assignerid !== req.user!.userId && todo.assigneeid !== req.user!.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
