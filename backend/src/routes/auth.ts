import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const authRouter = Router();

// Helper to hash password using SHA-256 for lightweight SQLite security
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(`zoom_salt_${password}`).digest('hex');
}

// Generate random 10-digit PMI (Personal Meeting ID)
function generatePMI(): string {
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  return `${p1} ${p2} ${p3}`;
}

// Default avatars pool
const AVATAR_POOL = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

/**
 * POST /api/auth/signup
 * Creates a new user in SQLite database and logs the exact signup date/time
 */
authRouter.post('/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 10)}`;
    const hashedPassword = hashPassword(password);
    const pmi = generatePMI();
    const avatarUrl = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
    const nowIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    // 1. Insert into users table with created_at and last_login_at
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, pmi, avatar_url, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), cleanEmail, hashedPassword, pmi, avatarUrl, nowIso, nowIso);

    // 2. Log Signup event in user_sessions_log
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO user_sessions_log (id, user_id, event_type, timestamp, date_formatted, ip_address, user_agent)
      VALUES (?, ?, 'SIGNUP', ?, ?, ?, ?)
    `).run(logId, userId, nowIso, dateFormatted, ipAddress, userAgent);

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      pmi,
      avatar_url: avatarUrl,
      created_at: nowIso,
      last_login_at: nowIso,
    };

    console.log(`[Auth] New user signed up: ${name} (${cleanEmail}) at ${nowIso}`);

    // Return User object + Token
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: `token_${userId}`,
      user: newUser,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during signup' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user credentials and records the exact login date/time
 */
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);

    const user = db.prepare(`
      SELECT id, name, email, password_hash, pmi, avatar_url, created_at, last_login_at
      FROM users WHERE LOWER(email) = ?
    `).get(cleanEmail) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please check credentials or sign up.' });
    }

    // Check password if set, or allow demo login if password_hash is null
    if (user.password_hash && user.password_hash !== hashedPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const nowIso = new Date().toISOString();
    const dateFormatted = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    // 1. Update last_login_at date in users table
    db.prepare(`
      UPDATE users SET last_login_at = ? WHERE id = ?
    `).run(nowIso, user.id);

    // 2. Log Login event in user_sessions_log
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO user_sessions_log (id, user_id, event_type, timestamp, date_formatted, ip_address, user_agent)
      VALUES (?, ?, 'LOGIN', ?, ?, ?, ?)
    `).run(logId, user.id, nowIso, dateFormatted, ipAddress, userAgent);

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      pmi: user.pmi || '942 581 4920',
      avatar_url: user.avatar_url || AVATAR_POOL[0],
      created_at: user.created_at,
      last_login_at: nowIso,
    };

    console.log(`[Auth] User logged in: ${user.name} (${user.email}) at ${nowIso}`);

    return res.json({
      success: true,
      message: 'Login successful!',
      token: `token_${user.id}`,
      user: userProfile,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current logged-in user profile
 */
authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'usr_rishabh';

    if (authHeader && authHeader.startsWith('Bearer token_')) {
      userId = authHeader.replace('Bearer token_', '');
    }

    const user = db.prepare(`
      SELECT id, name, email, pmi, avatar_url, created_at, last_login_at FROM users WHERE id = ? OR email = ?
    `).get(userId, 'rishabh@zoomclone.dev') as any;

    if (!user) {
      const defaultUser = db.prepare("SELECT id, name, email, pmi, avatar_url, created_at, last_login_at FROM users WHERE name = 'Rishabh' OR email LIKE 'rishabh%' LIMIT 1").get() as any;
      if (defaultUser) {
        return res.json({ success: true, user: defaultUser });
      }
      const firstUser = db.prepare('SELECT id, name, email, pmi, avatar_url, created_at, last_login_at FROM users LIMIT 1').get() as any;
      if (firstUser) {
        return res.json({ success: true, user: firstUser });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/auth/activity
 * Retrieves the user's signup date, last login date, and recent session logs
 */
authRouter.get('/activity', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'usr_rishabh';

    if (authHeader && authHeader.startsWith('Bearer token_')) {
      userId = authHeader.replace('Bearer token_', '');
    }

    const user = db.prepare(`
      SELECT id, name, email, created_at, last_login_at FROM users WHERE id = ? OR email = ?
    `).get(userId, 'rishabh@zoomclone.dev') as any;

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const logs = db.prepare(`
      SELECT id, event_type, timestamp, date_formatted, ip_address, user_agent
      FROM user_sessions_log
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT 10
    `).all(user.id);

    return res.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        signupDate: user.created_at,
        lastLoginDate: user.last_login_at,
        recentSessions: logs,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user activity' });
  }
});

/**
 * POST /api/auth/logout
 * Logs logout event in user_sessions_log
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer token_')) {
      const userId = authHeader.replace('Bearer token_', '');
      const nowIso = new Date().toISOString();
      const dateFormatted = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const logId = uuidv4();
      db.prepare(`
        INSERT INTO user_sessions_log (id, user_id, event_type, timestamp, date_formatted, ip_address, user_agent)
        VALUES (?, ?, 'LOGOUT', ?, ?, ?, ?)
      `).run(logId, userId, nowIso, dateFormatted, ipAddress, userAgent);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch {
    return res.json({ success: true, message: 'Logged out.' });
  }
});
