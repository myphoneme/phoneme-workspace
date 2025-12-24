import { Router, Request, Response } from 'express';
import db from '../db';
import { authenticateToken } from '../middleware/auth';
import type { CreateCommentInput, CommentWithAuthor } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all comments for a todo with author details
router.get('/todo/:todoId', async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await db.prepare(`
      SELECT
        c.*,
        u.name as authorname,
        u.email as authoremail
      FROM comments c
      JOIN users u ON c.authorid = u.id
      WHERE c.todoid = ?
      ORDER BY c.createdat ASC
    `).all(req.params.todoId) as CommentWithAuthor[];

    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create new comment
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { todoId, content }: CreateCommentInput = req.body;
    const authorId = req.user!.userId;

    if (!todoId || !content) {
      res.status(400).json({ error: 'Todo ID and content are required' });
      return;
    }

    // Check if todo exists
    const todo = await db.prepare('SELECT id FROM todos WHERE id = ?').get(todoId);
    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const result = await db.prepare(`
      INSERT INTO comments (todoid, authorid, content)
      VALUES (?, ?, ?)
    `).run(todoId, authorId, content);

    const newComment = await db.prepare(`
      SELECT
        c.*,
        u.name as authorname,
        u.email as authoremail
      FROM comments c
      JOIN users u ON c.authorid = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid) as CommentWithAuthor;

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete comment (only author or admin can delete)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id) as any;

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Only author or admin can delete
    if (comment.authorid !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }

    await db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
