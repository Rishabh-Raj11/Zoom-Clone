'use client';

import React, { useState, useEffect } from 'react';
import { Participant, LayoutMode } from '@/types';
import { ParticipantTile } from './ParticipantTile';

interface VideoGridProps {
  participants: Participant[];
  layoutMode: LayoutMode;
  activeSpeakerId?: string;
  isSharingActive?: boolean;
  onMuteUser?: (userId: string) => void;
  onKickUser?: (userId: string) => void;
  isCurrentUserHost?: boolean;
}

export function VideoGrid({
  participants,
  layoutMode,
  activeSpeakerId,
  isSharingActive = false,
  onMuteUser,
  onKickUser,
  isCurrentUserHost = false,
}: VideoGridProps) {
  const count = participants.length;
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobilePortrait(window.innerWidth < 640 && window.innerHeight > window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. LOCAL USER IS SHARING SCREEN -> Presenter Mode (Zero Infinite Mirror Loop)
  if (isSharingActive) {
    const remoteParticipants = participants.filter((p) => !p.isLocal);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
        {/* Top Thumbnail Strip of Remote Participants */}
        {remoteParticipants.length > 0 && (
          <div
            style={{
              height: isMobilePortrait ? '80px' : '110px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {remoteParticipants.map((p) => (
              <div key={p.id} style={{ width: isMobilePortrait ? '110px' : '160px', height: '100%', flexShrink: 0 }}>
                <ParticipantTile
                  participant={p}
                  onMuteUser={onMuteUser}
                  onKickUser={onKickUser}
                  isCurrentUserHost={isCurrentUserHost}
                />
              </div>
            ))}
          </div>
        )}

        {/* Presenter Canvas Card (Never renders screen mirror onto itself) */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #131722 0%, #0B0E14 100%)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 0 32px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              border: '2px solid #10B981',
              animation: 'pulseGlow 2s infinite',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            You are sharing your screen
          </h2>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
            All participants in the room are viewing your screen broadcast in Full HD.
          </p>

          <div
            style={{
              padding: '8px 18px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-full)',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulseGlow 1.5s infinite' }} />
            1080p 60fps Presentation Active
          </div>
        </div>
      </div>
    );
  }

  // 2. A REMOTE PARTICIPANT IS SHARING SCREEN -> Remote Spotlight Mode
  const remotePresenter = participants.find((p) => !p.isLocal && p.isSharing && p.stream);
  if (remotePresenter) {
    const otherParticipants = participants.filter((p) => p.id !== remotePresenter.id);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
        {/* Top Thumbnail Strip */}
        <div
          style={{
            height: isMobilePortrait ? '80px' : '110px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {otherParticipants.map((p) => (
            <div key={p.id} style={{ width: isMobilePortrait ? '110px' : '160px', height: '100%', flexShrink: 0 }}>
              <ParticipantTile
                participant={p}
                onMuteUser={onMuteUser}
                onKickUser={onKickUser}
                isCurrentUserHost={isCurrentUserHost}
              />
            </div>
          ))}
        </div>

        {/* Main Stage: High Definition Screen Share Presentation */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ParticipantTile
            participant={remotePresenter}
            isSpeaker={true}
            onMuteUser={onMuteUser}
            onKickUser={onKickUser}
            isCurrentUserHost={isCurrentUserHost}
          />
        </div>
      </div>
    );
  }

  // 3. SPEAKER VIEW MODE
  if (layoutMode === 'speaker' && count > 1) {
    const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) || participants[1] || participants[0];
    const otherParticipants = participants.filter((p) => p.id !== activeSpeaker.id);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
        {/* Top Thumbnail Strip */}
        <div
          style={{
            height: isMobilePortrait ? '80px' : '110px',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {otherParticipants.map((p) => (
            <div key={p.id} style={{ width: isMobilePortrait ? '110px' : '160px', height: '100%', flexShrink: 0 }}>
              <ParticipantTile
                participant={p}
                isSpeaker={p.id === activeSpeakerId}
                onMuteUser={onMuteUser}
                onKickUser={onKickUser}
                isCurrentUserHost={isCurrentUserHost}
              />
            </div>
          ))}
        </div>

        {/* Main Speaker Focus */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ParticipantTile
            participant={activeSpeaker}
            isSpeaker={true}
            onMuteUser={onMuteUser}
            onKickUser={onKickUser}
            isCurrentUserHost={isCurrentUserHost}
          />
        </div>
      </div>
    );
  }

  // 4. GALLERY VIEW MODE (Adaptive Mobile & Desktop Grid)
  let gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: isMobilePortrait ? '8px' : '12px',
    width: '100%',
    height: '100%',
    padding: isMobilePortrait ? '8px' : '12px',
  };

  if (count === 1) {
    gridStyle.gridTemplateColumns = '1fr';
    gridStyle.gridTemplateRows = '1fr';
  } else if (count === 2) {
    if (isMobilePortrait) {
      gridStyle.gridTemplateColumns = '1fr';
      gridStyle.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
      gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
      gridStyle.gridTemplateRows = '1fr';
    }
  } else if (count <= 4) {
    gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
    gridStyle.gridTemplateRows = 'repeat(2, 1fr)';
  } else if (count <= 6) {
    if (isMobilePortrait) {
      gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
      gridStyle.gridTemplateRows = 'repeat(3, 1fr)';
    } else {
      gridStyle.gridTemplateColumns = 'repeat(3, 1fr)';
      gridStyle.gridTemplateRows = 'repeat(2, 1fr)';
    }
  } else {
    gridStyle.gridTemplateColumns = isMobilePortrait ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
    gridStyle.gridTemplateRows = isMobilePortrait ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)';
  }

  return (
    <div style={gridStyle}>
      {participants.map((participant) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          isSpeaker={participant.id === activeSpeakerId}
          onMuteUser={onMuteUser}
          onKickUser={onKickUser}
          isCurrentUserHost={isCurrentUserHost}
        />
      ))}
    </div>
  );
}
