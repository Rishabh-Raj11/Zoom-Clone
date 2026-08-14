import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Meeting } from '../types/index.js';

export const meetingsRouter = Router();

// Helper to generate formatted 10-digit Meeting ID (e.g. "942 581 4920")
function generateMeetingId(): string {
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  return `${p1} ${p2} ${p3}`;
}

// Helper to generate 6-digit numeric passcode
function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET /api/meetings - List meetings (can filter by ?status=upcoming | ended)
meetingsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT m.*, u.name as host_name, u.avatar_url as host_avatar
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
    `;
    const params: any[] = [];

    if (status) {
      query += ` WHERE m.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY CASE WHEN m.scheduled_start IS NOT NULL THEN m.scheduled_start ELSE m.created_at END ASC`;

    const meetings = db.prepare(query).all(...params);
    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/meetings/:identifier - Get single meeting by internal UUID or 10-digit Meeting ID
meetingsRouter.get('/:identifier', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const cleanId = identifier.replace(/[\s-]/g, '');

    // Search by internal id OR formatted meeting_id OR sanitized meeting_id
    const meeting = db.prepare(`
      SELECT m.*, u.name as host_name, u.avatar_url as host_avatar
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
      WHERE m.id = ? 
         OR m.meeting_id = ? 
         OR REPLACE(REPLACE(m.meeting_id, ' ', ''), '-', '') = ?
    `).get(identifier, identifier, cleanId) as any;

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found or invalid Meeting ID' });
    }

    // Also fetch current participants
    const participants = db.prepare(`
      SELECT * FROM participants WHERE meeting_id = ? AND left_at IS NULL
    `).all(meeting.id);

    res.json({ success: true, data: { ...meeting, participants } });
  } catch (error: any) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/meetings/instant - Create Instant Meeting
meetingsRouter.post('/instant', (req: Request, res: Response) => {
  try {
    const { title, hostId, hostVideoDefault, participantVideoDefault } = req.body;
    
    const id = uuidv4();
    const meetingIdNum = generateMeetingId();
    const passcode = generatePasscode();
    const host = hostId || 'usr_rishabh';
    const meetingTitle = title || `Rishabh's Instant Zoom Meeting`;
    const cleanNum = meetingIdNum.replace(/\s/g, '');
    const clientOrigin = req.headers.origin || 'http://localhost:3001';
    const joinUrl = `${clientOrigin}/join/${cleanNum}`;

    const stmt = db.prepare(`
      INSERT INTO meetings (
        id, meeting_id, title, description, host_id,
        duration_minutes, status, passcode, join_url, is_instant,
        require_waiting_room, allow_screen_share, host_video_default, participant_video_default
      ) VALUES (?, ?, ?, ?, ?, ?, 'in_progress', ?, ?, 1, 0, 1, ?, ?)
    `);

    stmt.run(
      id,
      meetingIdNum,
      meetingTitle,
      'Instant video meeting launched from dashboard.',
      host,
      45,
      passcode,
      joinUrl,
      hostVideoDefault !== undefined ? (hostVideoDefault ? 1 : 0) : 1,
      participantVideoDefault !== undefined ? (participantVideoDefault ? 1 : 0) : 1
    );

    const created = db.prepare(`
      SELECT m.*, u.name as host_name
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
      WHERE m.id = ?
    `).get(id);

    res.status(201).json({
      success: true,
      message: 'Instant meeting created successfully',
      data: created
    });
  } catch (error: any) {
    console.error('Error creating instant meeting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/meetings/schedule - Schedule a Future Meeting
meetingsRouter.post('/schedule', (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      scheduledStart,
      durationMinutes,
      passcode,
      requireWaitingRoom,
      allowScreenShare,
      hostVideoDefault,
      participantVideoDefault,
      hostId
    } = req.body;

    if (!title || !scheduledStart) {
      return res.status(400).json({
        success: false,
        message: 'Title and scheduledStart date/time are required.'
      });
    }

    const id = uuidv4();
    const meetingIdNum = generateMeetingId();
    const meetingPasscode = passcode || generatePasscode();
    const host = hostId || 'usr_rishabh';
    const cleanNum = meetingIdNum.replace(/\s/g, '');
    const clientOrigin = req.headers.origin || 'http://localhost:3001';
    const joinUrl = `${clientOrigin}/join/${cleanNum}`;

    const stmt = db.prepare(`
      INSERT INTO meetings (
        id, meeting_id, title, description, host_id, scheduled_start,
        duration_minutes, status, passcode, join_url, is_instant,
        require_waiting_room, allow_screen_share, host_video_default, participant_video_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?, 0, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      meetingIdNum,
      title,
      description || '',
      host,
      new Date(scheduledStart).toISOString(),
      durationMinutes || 30,
      meetingPasscode,
      joinUrl,
      requireWaitingRoom ? 1 : 0,
      allowScreenShare !== undefined ? (allowScreenShare ? 1 : 0) : 1,
      hostVideoDefault !== undefined ? (hostVideoDefault ? 1 : 0) : 1,
      participantVideoDefault !== undefined ? (participantVideoDefault ? 1 : 0) : 1
    );

    const created = db.prepare(`
      SELECT m.*, u.name as host_name
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
      WHERE m.id = ?
    `).get(id);

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: created
    });
  } catch (error: any) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/meetings/:identifier/validate - Validate Meeting ID and optional passcode before joining
meetingsRouter.post('/:identifier/validate', (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const { passcode, displayName } = req.body;
    const cleanId = identifier.replace(/[\s-]/g, '');

    const meeting = db.prepare(`
      SELECT m.*, u.name as host_name
      FROM meetings m
      LEFT JOIN users u ON m.host_id = u.id
      WHERE m.id = ? 
         OR m.meeting_id = ? 
         OR REPLACE(REPLACE(m.meeting_id, ' ', ''), '-', '') = ?
    `).get(identifier, identifier, cleanId) as any;

    if (!meeting) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Meeting not found. Please verify the 10-digit Meeting ID.'
      });
    }

    if (passcode && meeting.passcode && meeting.passcode !== passcode) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid meeting passcode. Please check and try again.'
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        id: meeting.id,
        meetingId: meeting.meeting_id,
        title: meeting.title,
        hostName: meeting.host_name,
        scheduledStart: meeting.scheduled_start,
        durationMinutes: meeting.duration_minutes,
        requireWaitingRoom: Boolean(meeting.require_waiting_room),
        hostVideoDefault: Boolean(meeting.host_video_default),
        participantVideoDefault: Boolean(meeting.participant_video_default),
        passcode: meeting.passcode
      }
    });
  } catch (error: any) {
    console.error('Error validating meeting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/meetings/:id/status - Update meeting status (e.g. start or end)
meetingsRouter.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['upcoming', 'in_progress', 'ended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    db.prepare(`
      UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR meeting_id = ?
    `).run(status, id, id);

    res.json({ success: true, message: `Meeting status updated to ${status}` });
  } catch (error: any) {
    console.error('Error updating meeting status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/meetings/:id - Delete/cancel meeting
meetingsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM meetings WHERE id = ? OR meeting_id = ?').run(id, id);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
