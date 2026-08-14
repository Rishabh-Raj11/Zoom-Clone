import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'usr_rishabh';

    if (authHeader && authHeader.startsWith('Bearer token_')) {
      userId = authHeader.replace('Bearer token_', '');
    }

    const user = serverDb.getUserById(userId) || serverDb.getUsers()[0];
    const recentSessions = serverDb.getSessionLogs(user.id);

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        signupDate: user.created_at,
        lastLoginDate: user.last_login_at,
        recentSessions,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
