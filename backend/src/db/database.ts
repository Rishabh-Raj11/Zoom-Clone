import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'zoom_clone.db');

export const db = new Database(DB_PATH);

// Enable WAL mode & foreign keys for concurrency & data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log(`[Database] Initializing SQLite schema at: ${DB_PATH}`);

  // 1. Create Users table with created_at, last_login_at, password_hash & pmi columns
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      pmi TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely alter table if users table already existed without new columns
  try {
    db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT;`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN pmi TEXT;`);
  } catch (e) {}
  try {
    db.exec(`ALTER TABLE users ADD COLUMN last_login_at DATETIME;`);
  } catch (e) {}

  // 2. Create User Sessions & Activity Log table (Tracks exact signup & login dates)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('SIGNUP', 'LOGIN', 'LOGOUT')),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_formatted TEXT,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON user_sessions_log(timestamp);
  `);

  // 3. Create Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      host_id TEXT NOT NULL,
      scheduled_start DATETIME,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'in_progress', 'ended')),
      passcode TEXT NOT NULL,
      join_url TEXT NOT NULL,
      is_instant BOOLEAN NOT NULL DEFAULT 0,
      require_waiting_room BOOLEAN NOT NULL DEFAULT 0,
      allow_screen_share BOOLEAN NOT NULL DEFAULT 1,
      host_video_default BOOLEAN NOT NULL DEFAULT 1,
      participant_video_default BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON meetings(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
    CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_start ON meetings(scheduled_start);
  `);

  // 4. Create Participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      user_id TEXT,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'participant' CHECK(role IN ('host', 'co-host', 'participant')),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      left_at DATETIME,
      is_muted BOOLEAN NOT NULL DEFAULT 0,
      is_video_off BOOLEAN NOT NULL DEFAULT 0,
      is_hand_raised BOOLEAN NOT NULL DEFAULT 0,
      avatar_url TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
  `);

  // 5. Create Chat Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_direct BOOLEAN NOT NULL DEFAULT 0,
      recipient_id TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chat_meeting_id ON chat_messages(meeting_id);
  `);

  // 6. Create Recordings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      meeting_title TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      file_size_mb REAL NOT NULL,
      video_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_recordings_meeting ON recordings(meeting_id);
  `);

  console.log('[Database] Schema initialized successfully with user activity tracking.');
}
