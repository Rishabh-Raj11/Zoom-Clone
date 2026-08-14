import { Meeting, User, Recording } from '@/types';

// In-memory persistent serverless store with initial sample data
export interface UserSessionLog {
  id: string;
  user_id: string;
  event_type: 'SIGNUP' | 'LOGIN' | 'LOGOUT';
  timestamp: string;
  date_formatted: string;
  ip_address: string;
  user_agent: string;
}

let users: User[] = [
  {
    id: 'usr_rishabh',
    name: 'Rishabh',
    email: 'rishabh@zoomclone.dev',
    pmi: '942 581 4920',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: '2026-08-14T00:00:00.000Z',
    last_login_at: '2026-08-14T05:50:00.000Z',
  }
];

let passwords: Record<string, string> = {
  'rishabh@zoomclone.dev': 'password123',
};

let sessionLogs: UserSessionLog[] = [
  {
    id: 'log_init',
    user_id: 'usr_rishabh',
    event_type: 'LOGIN',
    timestamp: new Date().toISOString(),
    date_formatted: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    ip_address: '127.0.0.1',
    user_agent: 'Zoom Workplace App',
  }
];

const now = new Date();
let meetings: Meeting[] = [
  {
    id: 'mtg_1',
    meeting_id: '942 581 4920',
    title: 'Weekly Engineering Sync & Sprint Review',
    description: 'Sprint 42 demo, architecture review, and roadmap prioritization for Zoom platform.',
    host_id: 'usr_rishabh',
    host_name: 'Rishabh',
    scheduled_start: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    status: 'upcoming',
    passcode: '482910',
    join_url: '/join/9425814920',
    is_instant: false,
    require_waiting_room: true,
    allow_screen_share: true,
    host_video_default: true,
    participant_video_default: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 'mtg_2',
    meeting_id: '813 729 6041',
    title: 'Product Design & UI/UX Walkthrough',
    description: 'Reviewing new high-fidelity Figma components, dark mode tokens, and mobile responsiveness.',
    host_id: 'usr_rishabh',
    host_name: 'Rishabh',
    scheduled_start: new Date(now.getTime() + 3 * 3600 * 1000).toISOString(),
    duration_minutes: 30,
    status: 'upcoming',
    passcode: '193852',
    join_url: '/join/8137296041',
    is_instant: false,
    require_waiting_room: false,
    allow_screen_share: true,
    host_video_default: true,
    participant_video_default: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 'mtg_3',
    meeting_id: '755 194 8832',
    title: 'AI Companion & LLM Architecture Planning',
    description: 'Deep dive into real-time transcript streaming, OpenAI Whisper integration, and meeting action-item auto-generation.',
    host_id: 'usr_rishabh',
    host_name: 'Rishabh',
    scheduled_start: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
    duration_minutes: 60,
    status: 'upcoming',
    passcode: '774120',
    join_url: '/join/7551948832',
    is_instant: false,
    require_waiting_room: true,
    allow_screen_share: true,
    host_video_default: true,
    participant_video_default: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: 'mtg_past_1',
    meeting_id: '632 990 1284',
    title: 'Executive Leadership All-Hands',
    description: 'Q3 company performance review, financial metrics, and global hiring expansion updates.',
    host_id: 'usr_rishabh',
    host_name: 'Rishabh',
    scheduled_start: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    duration_minutes: 50,
    status: 'ended',
    passcode: '839201',
    join_url: '/join/6329901284',
    is_instant: false,
    require_waiting_room: false,
    allow_screen_share: true,
    host_video_default: true,
    participant_video_default: true,
    created_at: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mtg_past_2',
    meeting_id: '419 883 5521',
    title: 'Frontend Performance & WebRTC Optimization',
    description: 'Latency benchmark discussions, Opus audio codec fine-tuning, and VP9 video simulcast.',
    host_id: 'usr_rishabh',
    host_name: 'Rishabh',
    scheduled_start: new Date(now.getTime() - 50 * 3600 * 1000).toISOString(),
    duration_minutes: 40,
    status: 'ended',
    passcode: '552914',
    join_url: '/join/4198835521',
    is_instant: false,
    require_waiting_room: true,
    allow_screen_share: true,
    host_video_default: true,
    participant_video_default: true,
    created_at: new Date(now.getTime() - 52 * 3600 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 49 * 3600 * 1000).toISOString(),
  }
];

let recordings: Recording[] = [
  {
    id: 'rec_1',
    meeting_id: '632 990 1284',
    title: 'Executive Leadership All-Hands',
    duration_seconds: 3000,
    file_size_bytes: 471859200,
    file_url: 'https://assets.mixkit.co/videos/preview/mixkit-business-partners-having-an-online-meeting-42861-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    recorded_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    summary: 'Discussion covered Q3 revenue growth exceeding targets by 18%, new enterprise tier rollouts, and expansion into EMEA and APAC markets.'
  },
  {
    id: 'rec_2',
    meeting_id: '419 883 5521',
    title: 'Frontend Performance & WebRTC Optimization',
    duration_seconds: 2400,
    file_size_bytes: 335544320,
    file_url: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-people-working-at-a-conference-table-41618-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    recorded_at: new Date(now.getTime() - 50 * 3600 * 1000).toISOString(),
    summary: 'Team resolved peer connection renegotiation latency by 45%, finalized SDP bundling, and tested automated fallback for low-bandwidth scenarios.'
  }
];

export const serverDb = {
  getUsers: () => users,
  getUserById: (id: string) => users.find((u) => u.id === id || u.email === id),
  getUserByEmail: (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  addUser: (user: User, password?: string) => {
    users.push(user);
    if (password) {
      passwords[user.email.toLowerCase()] = password;
    }
  },
  verifyPassword: (email: string, pass: string) => {
    const p = passwords[email.toLowerCase()];
    if (!p) return pass === 'password123';
    return p === pass;
  },
  updateUserLogin: (id: string, timestamp: string) => {
    const u = users.find((x) => x.id === id || x.email === id);
    if (u) {
      u.last_login_at = timestamp;
    }
  },
  addSessionLog: (log: UserSessionLog) => {
    sessionLogs.unshift(log);
  },
  getSessionLogs: (userId: string) => {
    return sessionLogs.filter((l) => l.user_id === userId || l.user_id === 'usr_rishabh');
  },
  getMeetings: (status?: string) => {
    if (status) return meetings.filter((m) => m.status === status);
    return meetings;
  },
  getMeetingById: (id: string) => {
    const clean = id.replace(/\s/g, '');
    return meetings.find((m) => m.id === id || m.meeting_id.replace(/\s/g, '') === clean);
  },
  addMeeting: (m: Meeting) => {
    meetings.unshift(m);
    return m;
  },
  deleteMeeting: (id: string) => {
    meetings = meetings.filter((m) => m.id !== id && m.meeting_id !== id);
  },
  getRecordings: () => recordings,
};
