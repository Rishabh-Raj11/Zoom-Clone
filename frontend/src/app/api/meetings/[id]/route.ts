import { NextResponse } from 'next/server';
import { serverDb } from '@/lib/serverStore';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const meeting = serverDb.getMeetingById(params.id);
    if (!meeting) {
      // Auto create on-the-fly room for instant joined IDs
      const clean = params.id.replace(/\s/g, '');
      const dynamicRoom = {
        id: `mtg_${clean}`,
        meeting_id: params.id,
        title: `Meeting (${params.id})`,
        host_id: 'usr_rishabh',
        host_name: 'Rishabh',
        scheduled_start: new Date().toISOString(),
        duration_minutes: 60,
        status: 'in_progress' as const,
        passcode: '123456',
        join_url: `/join/${clean}`,
        is_instant: true,
        require_waiting_room: false,
        allow_screen_share: true,
        host_video_default: true,
        participant_video_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: dynamicRoom });
    }
    return NextResponse.json({ success: true, data: meeting });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Meeting not found' }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    serverDb.deleteMeeting(params.id);
    return NextResponse.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete meeting' }, { status: 500 });
  }
}
