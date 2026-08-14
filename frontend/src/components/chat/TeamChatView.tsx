'use client';

import React, { useState } from 'react';
import {
  Hash,
  MessageSquare,
  Search,
  Plus,
  Send,
  Smile,
  Paperclip,
  Video,
  Phone,
  MoreVertical,
  Users,
  Pin,
  Sparkles,
  Check,
  CheckCheck,
  Bold,
  Italic,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { createInstantMeeting } from '@/lib/api';

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  isSelf: boolean;
  content: string;
  timestamp: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  topic?: string;
  unreadCount?: number;
  avatar?: string;
  status?: 'online' | 'busy' | 'away' | 'offline';
  messages: Message[];
}

interface TeamChatViewProps {
  currentUser: User;
}

const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-general',
    name: 'general',
    type: 'channel',
    topic: 'Company-wide announcements and general discussions',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        senderName: 'Priya Sharma',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'Hey everyone! Welcome to the new Zoom Workplace platform. Everything is running smoothly on the updated infrastructure 🚀',
        timestamp: '10:30 AM',
        reactions: [{ emoji: '🎉', count: 4, users: ['Rishabh', 'Aarav', 'Ananya'] }, { emoji: '🚀', count: 3, users: ['Rishabh', 'Rohan'] }],
      },
      {
        id: 'm2',
        senderName: 'Aarav Patel',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'Audio and video latency tests look incredible under 15ms. Ready for the Sprint 42 demo call today!',
        timestamp: '10:34 AM',
        reactions: [{ emoji: '👍', count: 2, users: ['Priya', 'Rishabh'] }],
      },
      {
        id: 'm3',
        senderName: 'Ananya Iyer',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'I uploaded the new Figma wireframes to the Whiteboards tab for team review. Feel free to check it out!',
        timestamp: '10:45 AM',
        reactions: [{ emoji: '🎨', count: 3, users: ['Rishabh', 'Aarav', 'Priya'] }],
      },
    ],
  },
  {
    id: 'ch-engineering',
    name: 'engineering-sync',
    type: 'channel',
    topic: 'Backend WebRTC, SFU clustering & Next.js architecture',
    unreadCount: 2,
    messages: [
      {
        id: 'e1',
        senderName: 'Rohan Gupta',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'WebSocket signaling server connection pooling has been deployed. Handling 10,000 concurrent sockets without frame drops.',
        timestamp: '09:15 AM',
        reactions: [{ emoji: '🔥', count: 5, users: ['Rishabh', 'Aarav', 'Priya', 'Ananya'] }],
      },
      {
        id: 'e2',
        senderName: 'Aarav Patel',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'We also synced the Whiteboard delta coordinate stream so multi-user drawing has sub-millisecond propagation.',
        timestamp: '09:22 AM',
      },
    ],
  },
  {
    id: 'dm-priya',
    name: 'Priya Sharma',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    status: 'online',
    messages: [
      {
        id: 's1',
        senderName: 'Priya Sharma',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'Hi Rishabh! Do you have a few minutes for a quick video sync about the upcoming release?',
        timestamp: '11:05 AM',
      },
    ],
  },
  {
    id: 'dm-aarav',
    name: 'Aarav Patel',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    status: 'online',
    messages: [
      {
        id: 'd1',
        senderName: 'Aarav Patel',
        senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'Hey Rishabh, verified all 200 OK endpoints on port 3001. Ready whenever you are.',
        timestamp: '11:15 AM',
      },
    ],
  },
  {
    id: 'dm-ananya',
    name: 'Ananya Iyer',
    type: 'dm',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'busy',
    messages: [
      {
        id: 'el1',
        senderName: 'Ananya Iyer',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        isSelf: false,
        content: 'The new Zoom Clips feature is super slick. Great job on the async video recording module!',
        timestamp: 'Yesterday',
      },
    ],
  },
];

export function TeamChatView({ currentUser }: TeamChatViewProps) {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-general');
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStartingCall, setIsStartingCall] = useState(false);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isSelf: true,
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === activeChannelId) {
          return {
            ...ch,
            messages: [...ch.messages, newMessage],
          };
        }
        return ch;
      })
    );

    setInputText('');

    // Simulated teammate reply after 1.5 seconds if talking to someone
    if (activeChannel.type === 'dm') {
      setTimeout(() => {
        const autoReply: Message = {
          id: `reply-${Date.now()}`,
          senderName: activeChannel.name,
          senderAvatar: activeChannel.avatar || '',
          isSelf: false,
          content: `Thanks ${currentUser.name.split(' ')[0]}! Got your message: "${newMessage.content.slice(0, 30)}..." Let's jump on a quick Zoom call if needed!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChannels((prev) =>
          prev.map((ch) => (ch.id === activeChannel.id ? { ...ch, messages: [...ch.messages, autoReply] } : ch))
        );
      }, 1500);
    }
  };

  const handleQuickCall = async () => {
    try {
      setIsStartingCall(true);
      const meeting = await createInstantMeeting({
        title: `Meeting with ${activeChannel.name}`,
        hostVideoDefault: true,
        participantVideoDefault: true,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zoom_displayName', currentUser.name);
      }

      const cleanId = meeting.meeting_id.replace(/\s/g, '');
      router.push(`/meeting/${cleanId}`);
    } catch (err) {
      console.error('Failed to start quick call:', err);
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id !== activeChannelId) return ch;
        return {
          ...ch,
          messages: ch.messages.map((m) => {
            if (m.id !== msgId) return m;
            const existing = (m.reactions || []).find((r) => r.emoji === emoji);
            if (existing) {
              return {
                ...m,
                reactions: m.reactions?.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, currentUser.name] } : r
                ),
              };
            } else {
              return {
                ...m,
                reactions: [...(m.reactions || []), { emoji, count: 1, users: [currentUser.name] }],
              };
            }
          }),
        };
      })
    );
  };

  const channelList = channels.filter((c) => c.type === 'channel');
  const dmList = channels.filter((c) => c.type === 'dm');

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#11141D',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* LEFT SIDEBAR: Channels & Direct Messages */}
      <div
        style={{
          width: '280px',
          backgroundColor: '#161922',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Sidebar Header & Search */}
        <div style={{ padding: '16px 14px 12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              Team Chat
            </h2>
            <button
              title="New Chat"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(14, 113, 235, 0.15)',
                color: '#0E71EB',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={14} color="#64748B" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                paddingLeft: '32px',
                fontSize: '12px',
                borderRadius: '6px',
                backgroundColor: '#0D1017',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#FFF',
              }}
            />
          </div>
        </div>

        {/* Sidebar Lists */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Channels */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', padding: '0 8px 6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Channels
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {channelList.map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hash size={16} color={isActive ? '#0E71EB' : '#64748B'} />
                      <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500' }}>{ch.name}</span>
                    </div>
                    {Boolean(ch.unreadCount && ch.unreadCount > 0) && (
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#0E71EB', color: '#FFF', padding: '1px 6px', borderRadius: '10px' }}>
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', padding: '0 8px 6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Direct Messages
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {dmList.map((dm) => {
                const isActive = dm.id === activeChannelId;
                return (
                  <button
                    key={dm.id}
                    onClick={() => setActiveChannelId(dm.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={dm.avatar}
                        alt={dm.name}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: dm.status === 'online' ? '#10B981' : dm.status === 'busy' ? '#EF4444' : '#F59E0B',
                          border: '1.5px solid #161922',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500' }}>{dm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0E1118' }}>
        {/* Channel Header */}
        <div
          style={{
            height: '56px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            backgroundColor: '#13161F',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeChannel.type === 'channel' ? (
              <Hash size={20} color="#0E71EB" />
            ) : (
              <img
                src={activeChannel.avatar}
                alt={activeChannel.name}
                style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>{activeChannel.name}</div>
              {activeChannel.topic && (
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{activeChannel.topic}</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleQuickCall}
              disabled={isStartingCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0E71EB',
                color: '#FFF',
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(14, 113, 235, 0.4)',
              }}
            >
              <Video size={14} />
              <span>{isStartingCall ? 'Calling...' : 'Start Meeting'}</span>
            </button>

            <button
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#94A3B8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Users size={16} />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeChannel.messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: '85%',
                alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                flexDirection: msg.isSelf ? 'row-reverse' : 'row',
              }}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isSelf ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{msg.senderName}</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{msg.timestamp}</span>
                </div>

                <div
                  style={{
                    backgroundColor: msg.isSelf ? '#0E71EB' : '#1A1E29',
                    color: '#FFFFFF',
                    padding: '10px 16px',
                    borderRadius: msg.isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '13.5px',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    border: msg.isSelf ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {msg.content}
                </div>

                {/* Reactions */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {msg.reactions?.map((r, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddReaction(msg.id, r.emoji)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#FFF',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{r.emoji}</span>
                      <span style={{ fontWeight: '700' }}>{r.count}</span>
                    </button>
                  ))}

                  {/* Add Reaction Button */}
                  <button
                    onClick={() => handleAddReaction(msg.id, '❤️')}
                    title="Add reaction"
                    style={{
                      padding: '2px 6px',
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                      color: '#64748B',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    +❤️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <div style={{ padding: '16px 20px', backgroundColor: '#13161F', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <form
            onSubmit={handleSendMessage}
            style={{
              backgroundColor: '#0E1118',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${activeChannel.name}...`}
              rows={2}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFF',
                fontSize: '13px',
                resize: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button type="button" style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                  <Bold size={15} />
                </button>
                <button type="button" style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                  <Italic size={15} />
                </button>
                <button type="button" style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                  <Code size={15} />
                </button>
                <button type="button" style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                  <Paperclip size={15} />
                </button>
                <button type="button" style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}>
                  <Smile size={15} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: inputText.trim() ? '#0E71EB' : 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
