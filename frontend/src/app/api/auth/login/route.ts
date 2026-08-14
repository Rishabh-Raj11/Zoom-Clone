import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = serverDb.getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json({ success: false, message: 'No account found with this email. Please sign up.' }, { status: 401 });
    }

    if (!serverDb.verifyPassword(cleanEmail, password)) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    const nowIso = new Date().toISOString();
    serverDb.updateUserLogin(user.id, nowIso);
    serverDb.addSessionLog({
      id: `log_${Date.now()}`,
      user_id: user.id,
      event_type: 'LOGIN',
      timestamp: nowIso,
      date_formatted: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      ip_address: '127.0.0.1',
      user_agent: 'Zoom Workplace Vercel App',
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      token: `token_${user.id}`,
      user: {
        ...user,
        last_login_at: nowIso,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Login failed' }, { status: 500 });
  }
}
