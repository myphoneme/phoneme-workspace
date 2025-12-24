import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types';

const router = Router();

// All project routes require authentication
router.use(authenticateToken);

// List projects (used for task assignment)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query<Project>(`
      SELECT id, name, description, icon, createdat, updatedat
      FROM projects
      ORDER BY createdat DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Create project (admin only)
router.post('/', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, icon }: CreateProjectInput = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const existingResult = await query('SELECT id FROM projects WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (existingResult.rows.length > 0) {
      res.status(400).json({ error: 'Project with this name already exists' });
      return;
    }

    const insertResult = await query<Project>(
      `INSERT INTO projects (name, description, icon)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, icon, createdat, updatedat`,
      [name.trim(), description || '', icon || null]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project (admin only)
router.put('/:id', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = Number(req.params.id);
    const { name, description, icon }: UpdateProjectInput = req.body;

    const existingResult = await query<Project>('SELECT * FROM projects WHERE id = $1', [projectId]);
    const existing = existingResult.rows[0];

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (name && name.trim() !== existing.name) {
      const duplicateResult = await query('SELECT id FROM projects WHERE LOWER(name) = LOWER($1) AND id != $2', [name.trim(), projectId]);
      if (duplicateResult.rows.length > 0) {
        res.status(400).json({ error: 'Project with this name already exists' });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`);
      values.push(icon);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    updates.push(`updatedat = NOW()`);
    values.push(projectId);

    await query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const projectResult = await query<Project>(
      `SELECT id, name, description, icon, createdat, updatedat
       FROM projects
       WHERE id = $1`,
      [projectId]
    );

    res.json(projectResult.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

export default router;
