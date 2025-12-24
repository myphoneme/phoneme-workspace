import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all settings
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT key, value, "updatedAt" FROM settings');

    // Parse JSON values
    const parsed = result.rows.map((s: any) => ({
      key: s.key,
      value: JSON.parse(s.value),
      updatedAt: s.updatedAt,
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Get specific setting
router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query<{ key: string; value: string; updatedAt: string }>(
      'SELECT key, value, "updatedAt" FROM settings WHERE key = $1',
      [req.params.key]
    );

    const setting = result.rows[0];

    if (!setting) {
      res.status(404).json({ error: 'Setting not found' });
      return;
    }

    res.json({
      key: setting.key,
      value: JSON.parse(setting.value),
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to get setting' });
  }
});

// Update setting
router.put('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
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

    const existingResult = await query('SELECT key FROM settings WHERE key = $1', [key]);

    if (existingResult.rows.length > 0) {
      await query(
        `UPDATE settings SET value = $1, "updatedAt" = NOW() WHERE key = $2`,
        [JSON.stringify(value), key]
      );
    } else {
      await query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)`,
        [key, JSON.stringify(value)]
      );
    }

    const settingResult = await query<{ key: string; value: string; updatedAt: string }>(
      'SELECT key, value, "updatedAt" FROM settings WHERE key = $1',
      [key]
    );

    const setting = settingResult.rows[0];

    res.json({
      key: setting.key,
      value: JSON.parse(setting.value),
      updatedAt: setting.updatedAt,
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
