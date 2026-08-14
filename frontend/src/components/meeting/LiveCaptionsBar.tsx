'use client';

import React from 'react';
import { Subtitles } from 'lucide-react';

interface LiveCaptionsBarProps {
  isVisible: boolean;
  speakerName?: string;
  text?: string;
}

export function LiveCaptionsBar({ isVisible, speakerName, text }: LiveCaptionsBarProps) {
  if (!isVisible || !text) return null;

  return (
    <div
      className="glass-panel-heavy animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '96px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '10px 20px',
        borderRadius: 'var(--radius-full)',
        zIndex: 52,
        maxWidth: '700px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--zoom-blue)',
          color: '#FFF',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '800',
          textTransform: 'uppercase',
        }}
      >
        <Subtitles size={12} /> CC
      </div>

      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zoom-blue-hover)' }}>
        {speakerName || 'Speaker'}:
      </span>

      <span style={{ fontSize: '14px', fontWeight: '500', color: '#FFF' }}>
        "{text}"
      </span>
    </div>
  );
}
