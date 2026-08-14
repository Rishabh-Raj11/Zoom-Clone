export const REACTION_EMOJIS = ['👍', '👏', '❤️', '🎉', '😮', '😂', '🔥', '🚀'];

export const MOCK_PARTICIPANTS = [
  {
    id: 'mock-1',
    displayName: 'Priya Sharma',
    role: 'participant' as const,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'mock-2',
    displayName: 'Aarav Patel',
    role: 'co-host' as const,
    isMuted: true,
    isVideoOff: false,
    isHandRaised: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'mock-3',
    displayName: 'Ananya Iyer',
    role: 'participant' as const,
    isMuted: false,
    isVideoOff: true,
    isHandRaised: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];
