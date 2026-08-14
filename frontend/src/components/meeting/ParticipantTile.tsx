'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Hand, Shield, MoreVertical, Volume2 } from 'lucide-react';
import { Participant } from '@/types';

interface ParticipantTileProps {
  participant: Participant;
  isSpeaker?: boolean;
  onMuteUser?: (userId: string) => void;
  onKickUser?: (userId: string) => void;
  isCurrentUserHost?: boolean;
}

export function ParticipantTile({
  participant,
  isSpeaker = false,
  onMuteUser,
  onKickUser,
  isCurrentUserHost = false,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, participant.isVideoOff]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#10141E',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isSpeaker ? '3px solid var(--zoom-green-live)' : '1px solid var(--border-medium)',
        boxShadow: isSpeaker ? '0 0 24px rgba(16, 185, 129, 0.45), 0 8px 32px rgba(0,0,0,0.6)' : 'var(--shadow-md)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Video Stream */}
      {!participant.isVideoOff && participant.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: participant.isLocal ? 'scaleX(-1)' : 'none',
          }}
        />
      ) : (
        /* Camera Off - High Res Avatar Bubble */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.displayName}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--border-medium)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            />
          ) : (
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'var(--zoom-blue-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '800',
                color: '#FFF',
                boxShadow: 'var(--shadow-blue-glow)',
              }}
            >
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Hand Raised Badge */}
      {participant.isHandRaised && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            backgroundColor: '#F59E0B',
            color: '#000',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '800',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <Hand size={14} /> Hand Raised
        </div>
      )}

      {/* Floating Reaction */}
      {participant.reaction && (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            fontSize: '44px',
            animation: 'floatEmoji 2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {participant.reaction}
        </div>
      )}

      {/* Bottom Left: Name Capsule & Mic Status */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(9, 12, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: '600',
          color: '#FFFFFF',
          maxWidth: '85%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
      >
        {participant.isMuted ? (
          <MicOff size={13} color="var(--zoom-red)" />
        ) : (
          <Mic size={13} color="var(--zoom-green-live)" />
        )}
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {participant.displayName} {participant.isLocal ? '(You)' : ''}
        </span>
        {participant.role === 'host' && (
          <span
            style={{
              fontSize: '10px',
              color: 'var(--zoom-blue-hover)',
              fontWeight: '800',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(14, 113, 235, 0.15)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            Host
          </span>
        )}
      </div>
    </div>
  );
}
