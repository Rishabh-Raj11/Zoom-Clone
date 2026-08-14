'use client';

import React, { useState } from 'react';
import { Film, Play, Download, X, Calendar, Clock, Sparkles } from 'lucide-react';
import { Recording } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface RecordingsListProps {
  recordings: Recording[];
}

export function RecordingsList({ recordings }: RecordingsListProps) {
  const [activePlayback, setActivePlayback] = useState<Recording | null>(null);

  if (recordings.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '56px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <Film size={32} color="var(--zoom-red)" />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
          No cloud recordings found
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Record your in-progress meetings to access video playback, transcripts, and downloadable assets here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="glass-card"
            style={{
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              {/* Top Row: Cloud Tag & File Size */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="badge-rec">
                  <Film size={12} /> CLOUD MP4
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {rec.file_size_mb.toFixed(1)} MB
                </span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.3, marginBottom: '10px' }}>
                {rec.meeting_title}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} color="var(--zoom-blue)" />
                  <span>{formatDateTime(rec.created_at)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={13} color="var(--text-muted)" />
                  <span>Duration: {Math.floor(rec.duration_seconds / 60)}m {rec.duration_seconds % 60}s</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setActivePlayback(rec)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--zoom-blue-gradient)',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: 'var(--shadow-blue-glow)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <Play size={14} fill="#FFFFFF" /> Watch Video
              </button>

              <a
                href={rec.video_url}
                target="_blank"
                rel="noreferrer"
                download
                title="Download Recording MP4"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFF';
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <Download size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activePlayback && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
          onClick={() => setActivePlayback(null)}
        >
          <div
            className="glass-panel-heavy"
            style={{
              width: '100%',
              maxWidth: '860px',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 26px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-toolbar)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#FFF' }}>{activePlayback.meeting_title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Recorded on {formatDateTime(activePlayback.created_at)}
                </span>
              </div>
              <button
                onClick={() => setActivePlayback(null)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: '#000', position: 'relative', aspectRatio: '16/9' }}>
              <video
                src={activePlayback.video_url}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
