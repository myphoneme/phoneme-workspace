import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';
import type { Notification } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's notifications
router.get('/', (req: Request, res: Response): void => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT 50
    `).all(req.user!.userId) as any[];

    const formattedNotifications: Notification[] = notifications.map(n => ({
      ...n,
      isRead: Boolean(n.isRead),
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', (req: Request, res: Response): void => {
  try {
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE userId = ? AND isRead = 0
    `).get(req.user!.userId) as { count: number };

    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', (req: Request, res: Response): void => {
  try {
    const result = db.prepare(`
      UPDATE notifications SET isRead = 1
      WHERE id = ? AND userId = ?
    `).run(req.params.id, req.user!.userId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', (req: Request, res: Response): void => {
  try {
    db.prepare(`
      UPDATE notifications SET isRead = 1
      WHERE userId = ?
    `).run(req.user!.userId);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Delete notification
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const result = db.prepare(`
      DELETE FROM notifications WHERE id = ? AND userId = ?
    `).run(req.params.id, req.user!.userId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Helper function to create notification (exported for use in other routes)
export function createNotification(
  userId: number,
  type: Notification['type'],
  title: string,
  message: string,
  relatedId?: number
): void {
  try {
    db.prepare(`
      INSERT INTO notifications (userId, type, title, message, relatedId)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, type, title, message, relatedId || null);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export default router;
