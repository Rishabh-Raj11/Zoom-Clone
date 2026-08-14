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

  // Speaker View Mode
  if (layoutMode === 'speaker' && count > 1 && !isSharingActive) {
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

  // Gallery View Mode (Adaptive Mobile & Desktop Grid)
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
