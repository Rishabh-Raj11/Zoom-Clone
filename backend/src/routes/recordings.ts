import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const recordingsRouter = Router();

// GET /api/recordings - List all cloud recordings
recordingsRouter.get('/', (req: Request, res: Response) => {
  try {
    const recordings = db.prepare(`
      SELECT r.*, m.meeting_id as formatted_meeting_id
      FROM recordings r
      LEFT JOIN meetings m ON r.meeting_id = m.id
      ORDER BY r.created_at DESC
    `).all();

    res.json({ success: true, count: recordings.length, data: recordings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/recordings - Save a completed meeting recording
recordingsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { meetingId, meetingTitle, durationSeconds, fileSizeMb, videoUrl } = req.body;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO recordings (id, meeting_id, meeting_title, duration_seconds, file_size_mb, video_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      meetingId || 'rec-local',
      meetingTitle || 'Zoom Cloud Recording',
      durationSeconds || 120,
      fileSizeMb || 45.2,
      videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    );

    const recording = db.prepare('SELECT * FROM recordings WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: recording });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
