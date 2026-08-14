'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // Bind video stream
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      videoRef.current.play().catch((err) => {
        console.warn('[Video] Auto-play prevented:', err);
      });
    }
  }, [participant.stream, participant.isVideoOff]);

  // Bind separate audio stream (guarantees remote audio plays even if video is off or minimized)
  useEffect(() => {
    if (audioRef.current && participant.stream && !participant.isLocal) {
      audioRef.current.srcObject = participant.stream;
      audioRef.current.play().catch((err) => {
        console.warn('[Audio] Remote auto-play prevented by browser policy:', err);
        setAudioBlocked(true);
      });
    }
  }, [participant.stream, participant.isLocal]);

  const handleUnblockAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setAudioBlocked(false)).catch(() => {});
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

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
      {/* Remote Audio Track (Always mounted for remote participants) */}
      {!participant.isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          muted={false}
          style={{ display: 'none' }}
        />
      )}

      {/* Video Stream Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: !participant.isVideoOff && participant.stream ? 'block' : 'none',
          transform: participant.isLocal ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Camera Off Avatar Screen */}
      {(participant.isVideoOff || !participant.stream) && (
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
              {participant.displayName ? participant.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      )}

      {/* Mobile Autoplay Permission Overlay */}
      {audioBlocked && !participant.isLocal && (
        <button
          onClick={handleUnblockAudio}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            zIndex: 30,
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <Volume2 size={28} color="#10B981" />
          <span style={{ fontSize: '13px', fontWeight: '700' }}>Tap to Enable Audio</span>
        </button>
      )}

      {/* Hand Raised Badge */}
      {participant.isHandRaised && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.95)',
            color: '#000',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '800',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            zIndex: 10,
          }}
        >
          <Hand size={14} />
          <span>Hand Raised</span>
        </div>
      )}

      {/* Reaction Badge */}
      {participant.reaction && (
        <div
          className="animate-bounce"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '32px',
            zIndex: 15,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          }}
        >
          {participant.reaction}
        </div>
      )}

      {/* Active Speaker Ring Indicator */}
      {isSpeaker && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: participant.isHandRaised ? '135px' : '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.9)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              animation: 'pulse 1.5s infinite',
            }}
          />
          Speaking
        </div>
      )}

      {/* Bottom Name & Status Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 20, 30, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: 'calc(100% - 24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {participant.isMuted ? (
            <MicOff size={14} color="#EF4444" />
          ) : (
            <Mic size={14} color="#10B981" />
          )}
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {participant.displayName} {participant.isLocal ? '(You)' : ''}
        </span>

        {participant.role === 'host' && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: '800',
              backgroundColor: 'var(--zoom-blue)',
              color: '#FFF',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.4px',
            }}
          >
            HOST
          </span>
        )}
      </div>
    </div>
  );
}
