'use client';

import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Subtitles,
  Activity,
  ChevronUp,
  MoreHorizontal,
  X,
  Sparkles,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* MOBILE BOTTOM SHEET FOR SECONDARY TOOLS */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="glass-panel-heavy"
            style={{
              backgroundColor: '#131824',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 20px',
              border: '1px solid rgba(255,255,255,0.12)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Meeting Actions</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Emoji Reactions */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
                Reactions
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      fontSize: '24px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Tools */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {/* Whiteboard */}
              <button
                onClick={() => {
                  onToggleWhiteboard();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: isWhiteboardOpen ? 'rgba(14, 113, 235, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isWhiteboardOpen ? '1px solid var(--zoom-blue)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: isWhiteboardOpen ? '#0E71EB' : '#FFF',
                  gap: '8px',
                }}
              >
                <PenTool size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>Whiteboard</span>
              </button>

              {/* Participants */}
              <button
                onClick={() => {
                  onToggleParticipants();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: isParticipantsOpen ? 'rgba(14, 113, 235, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isParticipantsOpen ? '1px solid var(--zoom-blue)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: isParticipantsOpen ? '#0E71EB' : '#FFF',
                  gap: '8px',
                }}
              >
                <Users size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>Roster ({participantsCount})</span>
              </button>

              {/* Raise Hand */}
              <button
                onClick={() => {
                  onToggleHandRaise();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: isHandRaised ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isHandRaised ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: isHandRaised ? '#F59E0B' : '#FFF',
                  gap: '8px',
                }}
              >
                <Hand size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{isHandRaised ? 'Lower Hand' : 'Raise Hand'}</span>
              </button>

              {/* Polls */}
              <button
                onClick={() => {
                  onOpenPolls();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: '#FFF',
                  gap: '8px',
                }}
              >
                <BarChart3 size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>Polls</span>
              </button>

              {/* Captions */}
              <button
                onClick={() => {
                  onToggleCaptions();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: isCaptionsActive ? 'rgba(14, 113, 235, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isCaptionsActive ? '1px solid var(--zoom-blue)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: isCaptionsActive ? '#0E71EB' : '#FFF',
                  gap: '8px',
                }}
              >
                <Subtitles size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>Captions</span>
              </button>

              {/* Mock Peers Toggle */}
              <button
                onClick={() => {
                  onToggleMockParticipants();
                  setMobileMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '14px',
                  backgroundColor: isMockActive ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: isMockActive ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: isMockActive ? '#A78BFA' : '#FFF',
                  gap: '8px',
                }}
              >
                <Sparkles size={22} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>AI Peers</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BOTTOM CONTROL BAR */}
      <div
        style={{
          height: isMobile ? '68px' : '76px',
          backgroundColor: '#171A21',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-around' : 'space-between',
          padding: isMobile ? '0 8px' : '0 20px',
          position: 'relative',
          zIndex: 50,
          userSelect: 'none',
        }}
      >
        {/* Mute Button */}
        <button
          onClick={onToggleAudio}
          title={isMuted ? 'Unmute' : 'Mute'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            height: isMobile ? '50px' : '56px',
            borderRadius: '8px',
            backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: isMuted ? '#EF4444' : '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isMuted ? <MicOff size={20} color="#EF4444" /> : <Mic size={20} color="#FFFFFF" />}
          <span style={{ fontSize: '10px', marginTop: '3px', fontWeight: '600' }}>
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        {/* Video Button */}
        <button
          onClick={onToggleVideo}
          title={isVideoOff ? 'Start Video' : 'Stop Video'}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            height: isMobile ? '50px' : '56px',
            borderRadius: '8px',
            backgroundColor: isVideoOff ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
            color: isVideoOff ? '#EF4444' : '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isVideoOff ? <VideoOff size={20} color="#EF4444" /> : <Video size={20} color="#FFFFFF" />}
          <span style={{ fontSize: '10px', marginTop: '3px', fontWeight: '600' }}>
            {isVideoOff ? 'Start' : 'Stop'}
          </span>
        </button>

        {/* Chat Button (With live badge) */}
        <button
          onClick={onToggleChat}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            height: isMobile ? '50px' : '56px',
            borderRadius: '8px',
            color: isChatOpen ? '#0E71EB' : '#FFFFFF',
            backgroundColor: isChatOpen ? 'rgba(14, 113, 235, 0.15)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <MessageSquare size={20} />
          {unreadChatCount > 0 && !isChatOpen && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '6px',
                backgroundColor: 'var(--zoom-red)',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 5px',
                borderRadius: '10px',
              }}
            >
              {unreadChatCount}
            </span>
          )}
          <span style={{ fontSize: '10px', marginTop: '3px', fontWeight: '600' }}>Chat</span>
        </button>

        {/* Mobile React Button */}
        {isMobile && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setReactionsOpen(!reactionsOpen)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 8px',
                height: '50px',
                borderRadius: '8px',
                color: reactionsOpen ? '#0E71EB' : '#FFFFFF',
                backgroundColor: reactionsOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Smile size={20} />
              <span style={{ fontSize: '10px', marginTop: '3px', fontWeight: '600' }}>React</span>
            </button>

            {reactionsOpen && (
              <div
                className="glass-panel-heavy animate-fade-in"
                style={{
                  position: 'fixed',
                  bottom: '72px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  display: 'flex',
                  gap: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-medium)',
                  zIndex: 80,
                  backgroundColor: 'rgba(19, 24, 36, 0.95)',
                }}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setReactionsOpen(false);
                    }}
                    style={{
                      fontSize: '24px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '8px',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Share Screen (Desktop or Tablet) */}
        {!isMobile && (
          <button
            onClick={onToggleScreenShare}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '74px',
              height: '56px',
              borderRadius: '8px',
              color: isScreenSharing ? '#10B981' : '#10B981',
              backgroundColor: isScreenSharing ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Share2 size={20} color="#10B981" />
            <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600', color: '#10B981' }}>
              {isScreenSharing ? 'Stop Share' : 'Share'}
            </span>
          </button>
        )}

        {/* Desktop Only Extra Tools */}
        {!isMobile && (
          <>
            {/* Whiteboard */}
            <button
              onClick={onToggleWhiteboard}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '56px',
                borderRadius: '8px',
                color: isWhiteboardOpen ? '#0E71EB' : '#FFFFFF',
                backgroundColor: isWhiteboardOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <PenTool size={20} />
              <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Whiteboard</span>
            </button>

            {/* Participants */}
            <button
              onClick={onToggleParticipants}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '56px',
                borderRadius: '8px',
                color: isParticipantsOpen ? '#0E71EB' : '#FFFFFF',
                backgroundColor: isParticipantsOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Users size={20} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '12px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#FFF',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 5px',
                  borderRadius: '8px',
                }}
              >
                {participantsCount}
              </span>
              <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>Roster</span>
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
                borderRadius: '8px',
                color: isRecording ? '#EF4444' : '#FFFFFF',
                backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Disc size={20} color={isRecording ? '#EF4444' : '#FFFFFF'} />
              <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>
                {isRecording ? formatRecTime(recordingSeconds) : 'Record'}
              </span>
            </button>

            {/* Reactions Popover Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setReactionsOpen(!reactionsOpen)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '56px',
                  borderRadius: '8px',
                  color: reactionsOpen ? '#0E71EB' : '#FFFFFF',
                  backgroundColor: reactionsOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Smile size={20} />
                <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '500' }}>React</span>
              </button>

              {reactionsOpen && (
                <div
                  className="glass-panel-heavy animate-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: '68px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '8px',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-medium)',
                    zIndex: 60,
                  }}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onSendReaction(emoji);
                        setReactionsOpen(false);
                      }}
                      style={{
                        fontSize: '22px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '8px',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile "More" Menu Trigger */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 8px',
              height: '50px',
              borderRadius: '8px',
              color: '#FFFFFF',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={20} />
            <span style={{ fontSize: '10px', marginTop: '3px', fontWeight: '600' }}>More</span>
          </button>
        )}

        {/* End / Leave Button */}
        <button
          onClick={onLeaveMeeting}
          style={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: isMobile ? '12px' : '13px',
            padding: isMobile ? '8px 14px' : '8px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DC2626')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EF4444')}
        >
          {isHost ? (isMobile ? 'End' : 'End Meeting') : 'Leave'}
        </button>
      </div>
    </>
  );
}
