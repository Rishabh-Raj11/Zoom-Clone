export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
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
  meeting_id: string;
  user_id?: string;
  display_name: string;
  role: 'host' | 'co-host' | 'participant';
  joined_at: string;
  left_at?: string;
  is_muted: boolean;
  is_video_off: boolean;
  is_hand_raised: boolean;
  avatar_url?: string;
  breakout_room_id?: string;
}

export interface ChatMessage {
  id: string;
  meeting_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  is_direct: boolean;
  recipient_id?: string;
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

export interface BreakoutRoom {
  id: string;
  name: string;
  participantIds: string[];
}

export interface LiveTranscriptItem {
  id: string;
  speakerId: string;
  speakerName: string;
  text: string;
  timestamp: string;
}

export type WSMessageType =
  | 'join-room'
  | 'user-joined'
  | 'user-left'
  | 'offer'
  | 'answer'
  | 'ice-candidate'
  | 'chat-message'
  | 'user-state-change'
  | 'reaction'
  | 'raise-hand'
  | 'host-mute-all'
  | 'host-mute-user'
  | 'host-kick-user'
  | 'host-lock-room'
  | 'whiteboard-draw'
  | 'whiteboard-clear'
  | 'existing-participants'
  | 'create-poll'
  | 'vote-poll'
  | 'poll-update'
  | 'live-caption'
  | 'breakout-update'
  | 'admit-participant';

export interface WSMessage {
  type: WSMessageType;
  roomId: string;
  senderId: string;
  senderName?: string;
  targetId?: string;
  payload?: any;
}
