import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';
import type { Notification } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Helper to check if value is truthy (handles PostgreSQL bigint as string)
const isTruthy = (val: any) => val == 1 || val === '1' || val === true;

// Get user's notifications
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT * FROM notifications
      WHERE userid = $1
      ORDER BY createdat DESC
      LIMIT 50
    `, [req.user!.userId]);

    const formattedNotifications: Notification[] = result.rows.map((n: any) => ({
      ...n,
      isread: isTruthy(n.isread),
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM notifications
      WHERE userid = $1 AND isread = 0
    `, [req.user!.userId]);

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      UPDATE notifications SET isread = 1
      WHERE id = $1 AND userid = $2
    `, [req.params.id, req.user!.userId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', async (req: Request, res: Response): Promise<void> => {
  try {
    await query(`
      UPDATE notifications SET isread = 1
      WHERE userid = $1
    `, [req.user!.userId]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      DELETE FROM notifications WHERE id = $1 AND userid = $2
    `, [req.params.id, req.user!.userId]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Helper function to create notification (exported for use in other routes)
export async function createNotification(
  userId: number,
  type: Notification['type'],
  title: string,
  message: string,
  relatedId?: number
): Promise<void> {
  try {
    await query(`
      INSERT INTO notifications (userid, type, title, message, relatedid)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, type, title, message, relatedId || null]);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export default router;
