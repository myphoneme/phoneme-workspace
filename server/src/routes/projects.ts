import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// List projects (used for task assignment)
router.get('/', (req: Request, res: Response): void => {
  const projects = db.prepare(`
    SELECT id, name, description, icon, createdAt, updatedAt
    FROM projects
    ORDER BY createdAt DESC
  `).all() as Project[];

  res.json(projects);
});

// Create project (admin only)
router.post('/', requireAdmin, (req: Request, res: Response): void => {
  const { name, description, icon }: CreateProjectInput = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM projects WHERE LOWER(name) = LOWER(?)').get(name.trim());
  if (existing) {
    res.status(400).json({ error: 'Project with this name already exists' });
    return;
  }

  const result = db.prepare(`
    INSERT INTO projects (name, description, icon)
    VALUES (?, ?, ?)
  `).run(name.trim(), description || '', icon || null);

  const project = db.prepare(`
    SELECT id, name, description, icon, createdAt, updatedAt
    FROM projects
    WHERE id = ?
  `).get(result.lastInsertRowid) as Project;

  res.status(201).json(project);
});

// Update project (admin only)
router.put('/:id', requireAdmin, (req: Request, res: Response): void => {
  const projectId = Number(req.params.id);
  const { name, description, icon }: UpdateProjectInput = req.body;

  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (name && name.trim() !== existing.name) {
    const duplicate = db.prepare('SELECT id FROM projects WHERE LOWER(name) = LOWER(?) AND id != ?').get(name.trim(), projectId);
    if (duplicate) {
      res.status(400).json({ error: 'Project with this name already exists' });
      return;
    }
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name.trim());
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (icon !== undefined) {
    updates.push('icon = ?');
    values.push(icon);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  updates.push("updatedAt = datetime('now')");
  values.push(projectId);

  db.prepare(`
    UPDATE projects
    SET ${updates.join(', ')}
    WHERE id = ?
  `).run(...values);

  const project = db.prepare(`
    SELECT id, name, description, icon, createdAt, updatedAt
    FROM projects
    WHERE id = ?
  `).get(projectId) as Project;

  res.json(project);
});

export default router;
