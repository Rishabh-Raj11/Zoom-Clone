'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Video, MicOff, VideoOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatMeetingId } from '@/lib/utils';
import { validateMeeting } from '@/lib/api';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDisplayName?: string;
  isShareScreenMode?: boolean;
}

export function JoinModal({
  isOpen,
  onClose,
  defaultDisplayName = 'Rishabh',
  isShareScreenMode = false,
}: JoinModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) return;

    try {
      setIsValidating(true);
      setError(null);

      let cleanId = meetingInput.trim();
      if (cleanId.includes('/join/')) {
        cleanId = cleanId.split('/join/')[1].split('?')[0];
      }
      cleanId = cleanId.replace(/[\s-]/g, '');

      const res = await validateMeeting(cleanId, passcode || undefined, displayName);

      if (!res.valid) {
        if (res.message?.includes('passcode')) {
          setRequiresPasscode(true);
          setError(res.message);
          return;
        }
        setError(res.message || 'Invalid Meeting ID. Please verify and try again.');
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zoom_displayName', displayName);
        sessionStorage.setItem('zoom_initialAudio', (!noAudio).toString());
        sessionStorage.setItem('zoom_initialVideo', (!noVideo).toString());
        sessionStorage.setItem('zoom_shareScreenAuto', isShareScreenMode.toString());
      }

      onClose();
      router.push(`/join/${cleanId}`);
    } catch (err: any) {
      console.error('Join error:', err);
      setError('Connection error. Please check your network.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-heavy animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(14, 113, 235, 0.15)',
          border: '1px solid var(--border-medium)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 26px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-toolbar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--zoom-blue-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(14, 113, 235, 0.4)',
              }}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>
              {isShareScreenMode ? 'Share Screen to Meeting' : 'Join a Meeting'}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
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

        {/* Form Body */}
        <form onSubmit={handleJoin} style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '13px',
                color: '#F87171',
              }}
            >
              {error}
            </div>
          )}

          {/* Meeting ID Input */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Meeting ID or Personal Link
            </label>
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="e.g. 942 581 4920 or paste invite URL"
              required
              autoFocus
              style={{ width: '100%', fontSize: '15px', fontWeight: '600' }}
            />
          </div>

          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{ width: '100%', fontSize: '14px', fontWeight: '600' }}
            />
          </div>

          {/* Optional Passcode Input if required */}
          {requiresPasscode && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Meeting Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter 6-digit passcode"
                required
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Options Box */}
          <div
            style={{
              backgroundColor: 'rgba(16, 21, 34, 0.8)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={noAudio}
                onChange={(e) => setNoAudio(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }}
              />
              <span>Do not connect to audio</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={noVideo}
                onChange={(e) => setNoVideo(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }}
              />
              <span>Turn off my video</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '11px 20px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isValidating || !meetingInput.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--zoom-blue-gradient)',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: 'var(--radius-full)',
                fontSize: '14px',
                fontWeight: '800',
                boxShadow: 'var(--shadow-blue-glow)',
              }}
            >
              {isValidating ? 'Validating...' : 'Join Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
