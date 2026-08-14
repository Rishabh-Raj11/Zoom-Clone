import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      title = "Rishabh's Instant Meeting",
      host_video_default = true,
      participant_video_default = true,
      allow_screen_share = true,
      require_waiting_room = false,
    } = body;

    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(100 + Math.random() * 900);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const meetingNum = `${p1} ${p2} ${p3}`;
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    const id = `mtg_${Date.now()}`;
    const now = new Date().toISOString();

    const instantMeeting = {
      id,
      meeting_id: meetingNum,
      title,
      description: 'Quick-launched instant meeting room.',
      host_id: 'usr_rishabh',
      host_name: 'Rishabh',
      scheduled_start: now,
      duration_minutes: 60,
      status: 'in_progress' as const,
      passcode,
      join_url: `/join/${meetingNum.replace(/\s/g, '')}`,
      is_instant: true,
      require_waiting_room: Boolean(require_waiting_room),
      allow_screen_share: Boolean(allow_screen_share),
      host_video_default: Boolean(host_video_default),
      participant_video_default: Boolean(participant_video_default),
      created_at: now,
      updated_at: now,
    };

    serverDb.addMeeting(instantMeeting);

    return NextResponse.json({
      success: true,
      message: 'Instant meeting started',
      data: instantMeeting,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
