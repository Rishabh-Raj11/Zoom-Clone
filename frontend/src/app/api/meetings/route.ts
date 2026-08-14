import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const meetings = serverDb.getMeetings(status);
    return NextResponse.json({ success: true, count: meetings.length, data: meetings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description = '',
      scheduled_start,
      duration_minutes = 30,
      require_waiting_room = false,
      allow_screen_share = true,
      host_video_default = true,
      participant_video_default = true,
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
    }

    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const meetingNum = `${p1} ${p2} ${p3}`;
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    const id = `mtg_${Date.now()}`;
    const now = new Date().toISOString();

    const newMeeting = {
      id,
      meeting_id: meetingNum,
      title,
      description,
      host_id: 'usr_rishabh',
      host_name: 'Rishabh',
      scheduled_start: scheduled_start || now,
      duration_minutes: Number(duration_minutes),
      status: 'upcoming' as const,
      passcode,
      join_url: `/join/${meetingNum.replace(/\s/g, '')}`,
      is_instant: false,
      require_waiting_room: Boolean(require_waiting_room),
      allow_screen_share: Boolean(allow_screen_share),
      host_video_default: Boolean(host_video_default),
      participant_video_default: Boolean(participant_video_default),
      created_at: now,
      updated_at: now,
    };

    serverDb.addMeeting(newMeeting);

    return NextResponse.json({
      success: true,
      message: 'Meeting created successfully',
      data: newMeeting,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
