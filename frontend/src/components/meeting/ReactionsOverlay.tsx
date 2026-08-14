'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  xPercent: number;
}

interface ReactionsOverlayProps {
  reactions: FloatingReaction[];
}

export function ReactionsOverlay({ reactions }: ReactionsOverlayProps) {
  useEffect(() => {
    if (reactions.length > 0) {
      const latest = reactions[reactions.length - 1];
      if (latest.emoji === '🎉' || latest.emoji === '🔥' || latest.emoji === '🚀') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8, x: latest.xPercent / 100 },
        });
      }
    }
  }, [reactions]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 55,
      }}
    >
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            bottom: '80px',
            left: `${r.xPercent}%`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'floatEmoji 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards',
          }}
        >
          <span style={{ fontSize: '42px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
            {r.emoji}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#FFF',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              marginTop: '4px',
            }}
          >
            {r.senderName}
          </span>
        </div>
      ))}
    </div>
  );
}
