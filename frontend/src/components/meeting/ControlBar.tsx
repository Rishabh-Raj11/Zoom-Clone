'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  Users,
  MessageSquare,
  Share2,
  PenTool,
  Disc,
  Smile,
  PhoneOff,
  Hand,
  Bot,
  BarChart3,
  Subtitles,
  Activity,
  ChevronUp,
} from 'lucide-react';
import { REACTION_EMOJIS } from '@/lib/constants';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isWhiteboardOpen: boolean;
  isRecording: boolean;
  isHandRaised: boolean;
  isCaptionsActive: boolean;
  recordingSeconds: number;
  participantsCount: number;
  unreadChatCount: number;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isSecurityOpen: boolean;
  isHost: boolean;
  isMockActive: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleWhiteboard: () => void;
  onToggleRecord: () => void;
  onToggleHandRaise: () => void;
  onToggleCaptions: () => void;
  onOpenPolls: () => void;
  onOpenHealth: () => void;
  onSendReaction: (emoji: string) => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleSecurity: () => void;
  onToggleMockParticipants: () => void;
  onLeaveMeeting: () => void;
}

export function ControlBar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isWhiteboardOpen,
  isRecording,
  isHandRaised,
  isCaptionsActive,
  recordingSeconds,
  participantsCount,
  unreadChatCount,
  isChatOpen,
  isParticipantsOpen,
  isSecurityOpen,
  isHost,
  isMockActive,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleWhiteboard,
  onToggleRecord,
  onToggleHandRaise,
  onToggleCaptions,
  onOpenPolls,
  onOpenHealth,
  onSendReaction,
  onToggleChat,
  onToggleParticipants,
  onToggleSecurity,
  onToggleMockParticipants,
  onLeaveMeeting,
}: ControlBarProps) {
  const [reactionsOpen, setReactionsOpen] = useState(false);

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        height: '76px',
        backgroundColor: '#171A21',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'relative',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* LEFT: Mute & Video Controls with Zoom Chevron Arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Mute Button with Chevron */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onToggleAudio}
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              height: '56px',
              borderRadius: '6px',
              backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: isMuted ? '#EF4444' : '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isMuted) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              if (!isMuted) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isMuted ? <MicOff size={20} color="#EF4444" /> : <Mic size={20} color="#FFFFFF" />}
            <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>
          <button
            style={{
              height: '56px',
              padding: '0 4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <ChevronUp size={12} />
          </button>
        </div>

        {/* Video Button with Chevron */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onToggleVideo}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              height: '56px',
              borderRadius: '6px',
              backgroundColor: isVideoOff ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: isVideoOff ? '#EF4444' : '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isVideoOff) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            }}
            onMouseLeave={(e) => {
              if (!isVideoOff) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isVideoOff ? <VideoOff size={20} color="#EF4444" /> : <Video size={20} color="#FFFFFF" />}
            <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
              {isVideoOff ? 'Start Video' : 'Stop Video'}
            </span>
          </button>
          <button
            style={{
              height: '56px',
              padding: '0 4px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <ChevronUp size={12} />
          </button>
        </div>
      </div>

      {/* CENTER: Exact Zoom In-Meeting Collaboration Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Security */}
        <button
          onClick={onToggleSecurity}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: isSecurityOpen ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isSecurityOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isSecurityOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Shield size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Security</span>
        </button>

        {/* Participants */}
        <button
          onClick={onToggleParticipants}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '74px',
            height: '56px',
            borderRadius: '6px',
            color: isParticipantsOpen ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isParticipantsOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isParticipantsOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ position: 'relative' }}>
            <Users size={19} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-10px',
                fontSize: '10px',
                fontWeight: '800',
                backgroundColor: '#0E71EB',
                color: '#FFF',
                padding: '1px 5px',
                borderRadius: '10px',
                lineHeight: '12px',
              }}
            >
              {participantsCount}
            </span>
          </div>
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Participants</span>
        </button>

        {/* Chat */}
        <button
          onClick={onToggleChat}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: isChatOpen ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isChatOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isChatOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ position: 'relative' }}>
            <MessageSquare size={19} />
            {unreadChatCount > 0 && !isChatOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FF7426',
                }}
              />
            )}
          </div>
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Chat</span>
        </button>

        {/* Polls & Quizzes */}
        <button
          onClick={onOpenPolls}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <BarChart3 size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Polls</span>
        </button>

        {/* Share Screen (Official Zoom Bright Green Button) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onToggleScreenShare}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 12px',
              height: '56px',
              borderRadius: '6px',
              backgroundColor: isScreenSharing ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: isScreenSharing ? '#EF4444' : '#22C55E',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isScreenSharing) e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.12)';
            }}
            onMouseLeave={(e) => {
              if (!isScreenSharing) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Share2 size={20} strokeWidth={2.4} color={isScreenSharing ? '#EF4444' : '#22C55E'} />
            <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </span>
          </button>
          <button
            style={{
              height: '56px',
              padding: '0 2px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#22C55E',
              cursor: 'pointer',
            }}
          >
            <ChevronUp size={12} />
          </button>
        </div>

        {/* Whiteboard */}
        <button
          onClick={onToggleWhiteboard}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '74px',
            height: '56px',
            borderRadius: '6px',
            color: isWhiteboardOpen ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isWhiteboardOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isWhiteboardOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <PenTool size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Whiteboards</span>
        </button>

        {/* Record */}
        <button
          onClick={onToggleRecord}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: isRecording ? '#EF4444' : '#FFFFFF',
            backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => !isRecording && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isRecording && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Disc size={19} color={isRecording ? '#EF4444' : undefined} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
            {isRecording ? formatRecTime(recordingSeconds) : 'Record'}
          </span>
        </button>

        {/* Captions CC */}
        <button
          onClick={onToggleCaptions}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: isCaptionsActive ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isCaptionsActive ? 'rgba(14, 113, 235, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => !isCaptionsActive && (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isCaptionsActive && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Subtitles size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Captions</span>
        </button>

        {/* Reactions */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setReactionsOpen(!reactionsOpen)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '56px',
              borderRadius: '6px',
              color: isHandRaised ? '#F59E0B' : '#FFFFFF',
              backgroundColor: reactionsOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
            onMouseLeave={(e) => !reactionsOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {isHandRaised ? <Hand size={19} color="#F59E0B" /> : <Smile size={19} />}
            <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
              {isHandRaised ? 'Lower Hand' : 'Reactions'}
            </span>
          </button>

          {/* Reactions Popover */}
          {reactionsOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '68px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#1E2330',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                width: '260px',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setReactionsOpen(false);
                    }}
                    style={{
                      fontSize: '24px',
                      padding: '6px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onToggleHandRaise();
                  setReactionsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: isHandRaised ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: isHandRaised ? '#F59E0B' : '#FFFFFF',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: isHandRaised ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                <Hand size={14} />
                <span>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Solo Testing AI Peers */}
        <button
          onClick={onToggleMockParticipants}
          title="Toggle Simulated Participants"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '56px',
            borderRadius: '6px',
            color: isMockActive ? '#0E71EB' : '#94A3B8',
            backgroundColor: isMockActive ? 'rgba(14, 113, 235, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => !isMockActive && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Bot size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>AI Peers</span>
        </button>

        {/* Health */}
        <button
          onClick={onOpenHealth}
          title="Connection Health"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '6px',
            color: '#10B981',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Activity size={19} />
          <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Health</span>
        </button>
      </div>

      {/* RIGHT: Iconic Zoom Red End / Leave Button */}
      <div>
        <button
          onClick={onLeaveMeeting}
          style={{
            backgroundColor: '#E02828',
            color: '#FFFFFF',
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(224, 40, 40, 0.4)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C51C1C')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E02828')}
        >
          <span>{isHost ? 'End' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
}
