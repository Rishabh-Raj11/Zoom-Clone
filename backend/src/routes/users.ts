import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

export const usersRouter = Router();

// GET /api/users/me - Current default logged-in user
usersRouter.get('/me', (req: Request, res: Response) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_alex_morgan');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/users/me - Update user name/avatar
usersRouter.patch('/me', (req: Request, res: Response) => {
  try {
    const { name, email, avatar_url } = req.body;
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          avatar_url = COALESCE(?, avatar_url)
      WHERE id = 'usr_alex_morgan'
    `).run(name, email, avatar_url);

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get('usr_alex_morgan');
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
