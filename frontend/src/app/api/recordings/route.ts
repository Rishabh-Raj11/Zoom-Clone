import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function GET() {
  try {
    const recordings = serverDb.getRecordings();
    return NextResponse.json({ success: true, count: recordings.length, data: recordings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
