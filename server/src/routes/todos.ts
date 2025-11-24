import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';
import type { CreateTodoInput, UpdateTodoInput, TodoWithUsers } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all todos with user details
router.get('/', (req: Request, res: Response): void => {
  try {
    const todos = db.prepare(`
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      ORDER BY t.createdAt DESC
    `).all() as any[];

    const formattedTodos: TodoWithUsers[] = todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed),
      isFavorite: Boolean(todo.isFavorite),
    }));

    res.json(formattedTodos);
  } catch (error) {
    console.error('Fetch todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get single todo by ID
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const todo = db.prepare(`
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      WHERE t.id = ?
    `).get(req.params.id) as any;

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json({ ...todo, completed: Boolean(todo.completed), isFavorite: Boolean(todo.isFavorite) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Create new todo
router.post('/', (req: Request, res: Response): void => {
  try {
    const { title, description, assigneeId, priority, dueDate }: CreateTodoInput = req.body;
    const assignerId = req.user!.userId;

    if (!title || !description || !assigneeId) {
      res.status(400).json({ error: 'Title, description, and assignee are required' });
      return;
    }

    // Verify assignee exists and is active
    const assignee = db.prepare('SELECT id FROM users WHERE id = ? AND isActive = 1').get(assigneeId);
    if (!assignee) {
      res.status(400).json({ error: 'Invalid or inactive assignee' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO todos (title, description, assignerId, assigneeId, priority, dueDate)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description, assignerId, assigneeId, priority || 'medium', dueDate || null);

    const newTodo = db.prepare(`
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid) as any;

    res.status(201).json({ ...newTodo, completed: Boolean(newTodo.completed), isFavorite: Boolean(newTodo.isFavorite) });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update todo
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const { title, description, assigneeId, completed, priority, isFavorite, dueDate }: UpdateTodoInput = req.body;
    const todoId = req.params.id;

    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    // Verify new assignee if provided
    if (assigneeId !== undefined) {
      const assignee = db.prepare('SELECT id FROM users WHERE id = ? AND isActive = 1').get(assigneeId);
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
      updates.push('assigneeId = ?');
      values.push(assigneeId);
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
      updates.push('isFavorite = ?');
      values.push(isFavorite ? 1 : 0);
    }
    if (dueDate !== undefined) {
      updates.push('dueDate = ?');
      values.push(dueDate);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push("updatedAt = datetime('now')");
    values.push(todoId);

    db.prepare(`
      UPDATE todos
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedTodo = db.prepare(`
      SELECT
        t.*,
        assigner.name as assignerName,
        assigner.email as assignerEmail,
        assignee.name as assigneeName,
        assignee.email as assigneeEmail
      FROM todos t
      JOIN users assigner ON t.assignerId = assigner.id
      JOIN users assignee ON t.assigneeId = assignee.id
      WHERE t.id = ?
    `).get(todoId) as any;

    res.json({ ...updatedTodo, completed: Boolean(updatedTodo.completed), isFavorite: Boolean(updatedTodo.isFavorite) });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete todo
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
