import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email, and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = serverDb.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists. Please sign in.' }, { status: 400 });
    }

    const userId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    const nowIso = new Date().toISOString();
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const pmi = `${p1} ${p2} ${p3}`;

    const newUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      pmi,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      created_at: nowIso,
      last_login_at: nowIso,
    };

    serverDb.addUser(newUser, password);
    serverDb.addSessionLog({
      id: `log_${Date.now()}`,
      user_id: userId,
      event_type: 'SIGNUP',
      timestamp: nowIso,
      date_formatted: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      ip_address: '127.0.0.1',
      user_agent: 'Zoom Workplace Vercel App',
    });

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      token: `token_${userId}`,
      user: newUser,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Signup failed' }, { status: 500 });
  }
}
