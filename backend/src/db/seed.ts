import { db, initDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabase() {
  initDatabase();

  console.log('[Seed] Seeding sample data into SQLite database...');

  // 1. Seed Default User
  const defaultUserId = 'usr_rishabh';
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(defaultUserId);

  if (!existingUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, avatar_url)
      VALUES (?, ?, ?, ?)
    `).run(
      defaultUserId,
      'Rishabh',
      'rishabh@zoomclone.dev',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    );
    console.log('[Seed] Default user created (Rishabh).');
  }

  // 2. Clear existing sample meetings if any to re-seed cleanly
  const meetingCount = (db.prepare('SELECT COUNT(*) as count FROM meetings').get() as any).count;

  if (meetingCount === 0) {
    const now = new Date();
    
    // Upcoming Meeting 1: In 15 minutes
    const meeting1Time = new Date(now.getTime() + 15 * 60 * 1000);
    const meeting1Id = uuidv4();
    const meeting1Num = '942 581 4920';

    // Upcoming Meeting 2: Today afternoon
    const meeting2Time = new Date(now.getTime() + 3 * 3600 * 1000);
    const meeting2Id = uuidv4();
    const meeting2Num = '813 729 6041';

    // Upcoming Meeting 3: Tomorrow morning
    const meeting3Time = new Date(now.getTime() + 24 * 3600 * 1000);
    const meeting3Id = uuidv4();
    const meeting3Num = '755 194 8832';

    // Past Meeting 1: Yesterday
    const past1Time = new Date(now.getTime() - 26 * 3600 * 1000);
    const past1Id = uuidv4();
    const past1Num = '632 990 1284';

    // Past Meeting 2: 2 days ago
    const past2Time = new Date(now.getTime() - 50 * 3600 * 1000);
    const past2Id = uuidv4();
    const past2Num = '419 883 5521';

    const insertMeeting = db.prepare(`
      INSERT INTO meetings (
        id, meeting_id, title, description, host_id, scheduled_start,
        duration_minutes, status, passcode, join_url, is_instant,
        require_waiting_room, allow_screen_share, host_video_default, participant_video_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert Upcoming
    insertMeeting.run(
      meeting1Id,
      meeting1Num,
      'Weekly Engineering Sync & Sprint Review',
      'Sprint 42 demo, architecture review, and roadmap prioritization for Zoom platform.',
      defaultUserId,
      meeting1Time.toISOString(),
      45,
      'upcoming',
      '482910',
      `http://localhost:3001/join/${meeting1Num.replace(/\s/g, '')}`,
      0,
      1,
      1,
      1,
      1
    );

    insertMeeting.run(
      meeting2Id,
      meeting2Num,
      'Product Design & UI/UX Walkthrough',
      'Reviewing new high-fidelity Figma components, dark mode tokens, and mobile responsiveness.',
      defaultUserId,
      meeting2Time.toISOString(),
      30,
      'upcoming',
      '193852',
      `http://localhost:3001/join/${meeting2Num.replace(/\s/g, '')}`,
      0,
      0,
      1,
      1,
      1
    );

    insertMeeting.run(
      meeting3Id,
      meeting3Num,
      'Quarterly All-Hands & Executive Q&A',
      'Company metrics, new feature announcements, and open mic session with executive team.',
      defaultUserId,
      meeting3Time.toISOString(),
      60,
      'upcoming',
      '849201',
      `http://localhost:3001/join/${meeting3Num.replace(/\s/g, '')}`,
      0,
      1,
      0,
      1,
      0
    );

    // Insert Past Meetings
    insertMeeting.run(
      past1Id,
      past1Num,
      'Client Onboarding: Scaler Global Tech',
      'Technical integration deep dive, API key provisioning, and SDK walkthrough.',
      defaultUserId,
      past1Time.toISOString(),
      45,
      'ended',
      '551920',
      `http://localhost:3001/join/${past1Num.replace(/\s/g, '')}`,
      0,
      0,
      1,
      1,
      1
    );

    insertMeeting.run(
      past2Id,
      past2Num,
      'Backend Architecture: WebRTC & Scaling',
      'SFU vs MCU evaluation, STUN/TURN deployment, and WebSocket connection pool benchmarks.',
      defaultUserId,
      past2Time.toISOString(),
      60,
      'ended',
      '301984',
      `http://localhost:3001/join/${past2Num.replace(/\s/g, '')}`,
      0,
      0,
      1,
      1,
      1
    );

    // Seed Sample Participants for Past Meetings
    const insertParticipant = db.prepare(`
      INSERT INTO participants (id, meeting_id, display_name, role, is_muted, is_video_off, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertParticipant.run(uuidv4(), past1Id, 'Rishabh (Host)', 'host', 0, 0, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
    insertParticipant.run(uuidv4(), past1Id, 'Priya Sharma', 'participant', 1, 0, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');
    insertParticipant.run(uuidv4(), past1Id, 'Aarav Patel', 'participant', 0, 0, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80');

    // Seed Cloud Recordings
    const insertRecording = db.prepare(`
      INSERT INTO recordings (id, meeting_id, meeting_title, duration_seconds, file_size_mb, video_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertRecording.run(
      uuidv4(),
      past1Id,
      'Client Onboarding: Scaler Global Tech - Recording',
      2700, // 45 mins
      142.8,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    );

    insertRecording.run(
      uuidv4(),
      past2Id,
      'Backend Architecture: WebRTC & Scaling - Recording',
      3600, // 60 mins
      198.4,
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    );

    console.log('[Seed] Sample meetings, participants, and recordings seeded successfully.');
  } else {
    console.log(`[Seed] Database already contains ${meetingCount} meetings. Skipping seed.`);
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase();
}
