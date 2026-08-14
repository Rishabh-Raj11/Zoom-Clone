export interface User {
  id: string;
  name: string;
  email: string;
  pmi?: string;
  avatar_url?: string;
  created_at: string;
  last_login_at?: string;
}

export type MeetingStatus = 'upcoming' | 'in_progress' | 'ended';

export interface Meeting {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  host_id: string;
  host_name?: string;
  scheduled_start?: string;
  duration_minutes: number;
  status: MeetingStatus;
  passcode: string;
  join_url: string;
  is_instant: boolean;
  require_waiting_room: boolean;
  allow_screen_share: boolean;
  host_video_default: boolean;
  participant_video_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  meeting_id?: string;
  user_id?: string;
  displayName: string;
  role: 'host' | 'co-host' | 'participant';
  joined_at?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
  reaction?: string;
  isLocal?: boolean;
  stream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  meeting_id?: string;
  senderId: string;
  senderName: string;
  message?: string;
  content?: string;
  timestamp: string;
  isDirect?: boolean;
  recipientId?: string;
  targetId?: string;
}

export interface Recording {
  id: string;
  meeting_id: string;
  meeting_title: string;
  duration_seconds: number;
  file_size_mb: number;
  video_url: string;
  created_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUserIds: string[];
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  status: 'active' | 'closed';
  creatorId: string;
  totalVotes: number;
}

export type LayoutMode = 'gallery' | 'speaker';

export interface WhiteboardPoint {
  x: number;
  y: number;
  prevX?: number | null;
  prevY?: number | null;
  color: string;
  size: number;
  tool?: 'pen' | 'eraser' | 'highlighter';
  isDragging?: boolean;
}
