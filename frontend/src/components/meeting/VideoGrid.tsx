'use client';

import React from 'react';
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

  // Speaker View Mode
  if (layoutMode === 'speaker' && count > 1 && !isSharingActive) {
    const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) || participants[1] || participants[0];
    const otherParticipants = participants.filter((p) => p.id !== activeSpeaker.id);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
        {/* Top Thumbnail Strip */}
        <div
          style={{
            height: '110px',
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {otherParticipants.map((p) => (
            <div key={p.id} style={{ width: '160px', height: '100%', flexShrink: 0 }}>
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

  // Gallery View Mode (Dynamic Responsive Grid)
  let gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '12px',
    width: '100%',
    height: '100%',
    padding: '12px',
  };

  if (count === 1) {
    gridStyle.gridTemplateColumns = '1fr';
    gridStyle.gridTemplateRows = '1fr';
  } else if (count === 2) {
    gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
    gridStyle.gridTemplateRows = '1fr';
  } else if (count <= 4) {
    gridStyle.gridTemplateColumns = 'repeat(2, 1fr)';
    gridStyle.gridTemplateRows = 'repeat(2, 1fr)';
  } else if (count <= 6) {
    gridStyle.gridTemplateColumns = 'repeat(3, 1fr)';
    gridStyle.gridTemplateRows = 'repeat(2, 1fr)';
  } else {
    gridStyle.gridTemplateColumns = 'repeat(3, 1fr)';
    gridStyle.gridTemplateRows = 'repeat(3, 1fr)';
  }

  return (
    <div style={gridStyle}>
      {participants.map((participant) => (
        <div key={participant.id} style={{ width: '100%', height: '100%', minHeight: 0 }}>
          <ParticipantTile
            participant={participant}
            isSpeaker={participant.id === activeSpeakerId}
            onMuteUser={onMuteUser}
            onKickUser={onKickUser}
            isCurrentUserHost={isCurrentUserHost}
          />
        </div>
      ))}
    </div>
  );
}
