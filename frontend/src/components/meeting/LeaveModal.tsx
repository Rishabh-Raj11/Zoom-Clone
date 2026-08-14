'use client';

import React from 'react';
import { PhoneOff, X, LogOut, StopCircle } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  onLeaveOnly: () => void;
  onEndMeetingForAll: () => void;
}

export function LeaveModal({
  isOpen,
  onClose,
  isHost,
  onLeaveOnly,
  onEndMeetingForAll,
}: LeaveModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          padding: '28px 24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(224, 40, 40, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <PhoneOff size={24} color="var(--zoom-red)" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
          {isHost ? 'End or Leave Meeting?' : 'Leave Meeting?'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {isHost
            ? 'As the meeting host, you can end the meeting for all participants or leave and assign another host.'
            : 'Are you sure you want to leave this meeting? You can rejoin anytime using the meeting ID.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isHost && (
            <button
              onClick={onEndMeetingForAll}
              style={{
                width: '100%',
                backgroundColor: 'var(--zoom-red)',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(224, 40, 40, 0.4)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--zoom-red-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--zoom-red)')}
            >
              <StopCircle size={16} /> End Meeting for All
            </button>
          )}

          <button
            onClick={onLeaveOnly}
            style={{
              width: '100%',
              backgroundColor: isHost ? 'var(--bg-card)' : 'var(--zoom-red)',
              color: '#FFFFFF',
              border: isHost ? '1px solid var(--border-subtle)' : 'none',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <LogOut size={16} /> Leave Meeting
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
