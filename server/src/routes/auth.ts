import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import db from '../db';
import { generateToken, authenticateToken } from '../middleware/auth';
import type { User, LoginInput, JwtPayload } from '../types';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google OAuth Login
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ error: 'Google credential is required' });
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    res.status(500).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID environment variable.' });
    return;
  }

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || email.split('@')[0];
    const emailDomain = email.split('@')[1];
    const profilePhoto = payload.picture || null;

    // Check domain restriction
    const allowedDomainsSetting = await db.prepare('SELECT value FROM settings WHERE key = ?').get('allowed_domains') as { value: string } | undefined;
    if (allowedDomainsSetting) {
      const allowedDomains: string[] = JSON.parse(allowedDomainsSetting.value);
      if (allowedDomains.length > 0 && !allowedDomains.includes(emailDomain)) {
        res.status(403).json({ error: `Your email domain (${emailDomain}) is not allowed. Contact your administrator.` });
        return;
      }
    }

    // Check if user exists
    let user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

    if (user) {
      // Existing user - check if active
      if (!user.isactive && user.isactive !== 1) {
        res.status(403).json({ error: 'Your account is deactivated. Contact your administrator.' });
        return;
      }
      // Update profile photo and last login
      await db.prepare(`
        UPDATE users SET profilephoto = ?, lastloginat = NOW(), updatedat = NOW()
        WHERE id = ?
      `).run(profilePhoto, user.id);
      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as User;
    } else {
      // Create new user with 'user' role (first user becomes admin)
      const userCount = await db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const role = Number(userCount.count) === 0 ? 'admin' : 'user';

      const result = await db.prepare(`
        INSERT INTO users (email, password, name, role, profilephoto, lastloginat)
        VALUES (?, ?, ?, ?, ?, NOW())
      `).run(email, '', name, role, profilePhoto);

      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
      console.log(`New user created via Google: ${email} (${role})`);
    }

    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(jwtPayload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePhoto: user.profilephoto,
        lastLoginAt: user.lastloginat,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Email/Password Login (kept for default admin)
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password }: LoginInput = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as User | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check isactive - PostgreSQL returns bigint as string
    const isActive = user.isactive == 1 || user.isactive === '1' || user.isactive === true;
    if (!isActive) {
      res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
      return;
    }

    // If user has no password (Google-only user), reject password login
    if (!user.password) {
      res.status(400).json({ error: 'This account uses Google Sign-In. Please login with Google.' });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(payload);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await db.prepare('SELECT id, email, name, role, isactive, profilephoto, lastloginat, createdat FROM users WHERE id = ?').get(req.user!.userId) as User | undefined;

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
