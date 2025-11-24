import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all settings
router.get('/', (_req: Request, res: Response): void => {
  const settings = db.prepare('SELECT key, value, updatedAt FROM settings').all();

  // Parse JSON values
  const parsed = settings.map((s: any) => ({
    key: s.key,
    value: JSON.parse(s.value),
    updatedAt: s.updatedAt,
  }));

  res.json(parsed);
});

// Get specific setting
router.get('/:key', (req: Request, res: Response): void => {
  const setting = db.prepare('SELECT key, value, updatedAt FROM settings WHERE key = ?').get(req.params.key) as { key: string; value: string; updatedAt: string } | undefined;

  if (!setting) {
    res.status(404).json({ error: 'Setting not found' });
    return;
  }

  res.json({
    key: setting.key,
    value: JSON.parse(setting.value),
    updatedAt: setting.updatedAt,
  });
});

// Update setting
router.put('/:key', (req: Request, res: Response): void => {
  const { value } = req.body;
  const key = req.params.key;

  if (value === undefined) {
    res.status(400).json({ error: 'Value is required' });
    return;
  }

  // Validate allowed_domains format
  if (key === 'allowed_domains') {
    if (!Array.isArray(value)) {
      res.status(400).json({ error: 'allowed_domains must be an array' });
      return;
    }

    for (const domain of value) {
      if (typeof domain !== 'string' || domain.length === 0) {
        res.status(400).json({ error: 'Each domain must be a non-empty string' });
        return;
      }
    }
  }

  const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);

  if (existing) {
    db.prepare(`
      UPDATE settings
      SET value = ?, updatedAt = datetime('now')
      WHERE key = ?
    `).run(JSON.stringify(value), key);
  } else {
    db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
    `).run(key, JSON.stringify(value));
  }

  const setting = db.prepare('SELECT key, value, updatedAt FROM settings WHERE key = ?').get(key) as { key: string; value: string; updatedAt: string };

  res.json({
    key: setting.key,
    value: JSON.parse(setting.value),
    updatedAt: setting.updatedAt,
  });
});

export default router;
