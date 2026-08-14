'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Radio,
  Sliders,
} from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { validateMeeting } from '@/lib/api';
import { formatMeetingId } from '@/lib/utils';

interface GreenRoomProps {
  meetingId: string;
}

export function GreenRoom({ meetingId }: GreenRoomProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('Alex Morgan');
  const [passcode, setPasscode] = useState('');
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Media Stream
  const {
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    audioLevel,
    permissionError,
    toggleVideo,
    toggleAudio,
  } = useMediaStream(true, true);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('zoom_displayName');
      if (savedName) setDisplayName(savedName);
    }
  }, []);

  useEffect(() => {
    async function checkMeeting() {
      try {
        setLoading(true);
        const res = await validateMeeting(meetingId);
        if (res.valid) {
          setValid(true);
          setMeetingDetails(res.data);
        } else {
          setValid(false);
          setErrorMsg(res.message || 'Meeting not found');
        }
      } catch (err: any) {
        setValid(false);
        setErrorMsg('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    }
    checkMeeting();
  }, [meetingId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('zoom_displayName', displayName);
      sessionStorage.setItem('zoom_initialAudio', isAudioEnabled.toString());
      sessionStorage.setItem('zoom_initialVideo', isVideoEnabled.toString());
    }

    const cleanId = meetingId.replace(/[\s-]/g, '');
    router.push(`/meeting/${cleanId}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 113, 235, 0.15) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel-heavy"
        style={{
          width: '100%',
          maxWidth: '960px',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(14, 113, 235, 0.15)',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(300px, 0.85fr)',
          border: '1px solid var(--border-medium)',
          zIndex: 2,
        }}
      >
        {/* Left: Broadcast Studio Camera Preview */}
        <div
          style={{
            backgroundColor: '#090C12',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#121722',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 8px 30px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-medium)',
            }}
          >
            {isVideoEnabled && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
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
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                  Camera is turned off
                </span>
              </div>
            )}

            {/* Audio Frequency Equalizer Meter Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: '14px',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(9, 12, 18, 0.8)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {isAudioEnabled ? (
                <Mic size={15} color="var(--zoom-green-live)" />
              ) : (
                <MicOff size={15} color="var(--zoom-red)" />
              )}
              {/* 8-Band Live Volume Equalizer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '14px' }}>
                {[10, 25, 40, 55, 70, 85, 95].map((threshold, idx) => {
                  const isActive = isAudioEnabled && audioLevel >= threshold;
                  return (
                    <div
                      key={idx}
                      style={{
                        width: '3px',
                        height: `${(idx + 1) * 2 + 3}px`,
                        borderRadius: '2px',
                        backgroundColor: isActive ? 'var(--zoom-green-live)' : 'rgba(255, 255, 255, 0.2)',
                        boxShadow: isActive ? '0 0 6px var(--zoom-green-live)' : 'none',
                        transition: 'all 0.1s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* HD 1080p Badge */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#FFF',
                letterSpacing: '0.5px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              HD 1080P
            </div>
          </div>

          {/* Quick Hardware Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
            <button
              onClick={toggleAudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isAudioEnabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.2)',
                color: isAudioEnabled ? '#FFFFFF' : 'var(--zoom-red)',
                border: isAudioEnabled ? '1px solid var(--border-medium)' : '1px solid var(--zoom-red)',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              {isAudioEnabled ? <Mic size={17} color="var(--zoom-green-live)" /> : <MicOff size={17} />}
              <span>{isAudioEnabled ? 'Mic Active' : 'Mic Muted'}</span>
            </button>

            <button
              onClick={toggleVideo}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isVideoEnabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239, 68, 68, 0.2)',
                color: isVideoEnabled ? '#FFFFFF' : 'var(--zoom-red)',
                border: isVideoEnabled ? '1px solid var(--border-medium)' : '1px solid var(--zoom-red)',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              {isVideoEnabled ? <Video size={17} color="var(--zoom-blue)" /> : <VideoOff size={17} />}
              <span>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</span>
            </button>
          </div>
        </div>

        {/* Right: Meeting Verification & Entry Action */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--zoom-green-live)',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                marginBottom: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Lock size={12} /> Verified Meeting Room
            </div>

            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '24px 0' }}>
                Connecting & verifying room credentials...
              </div>
            ) : valid && meetingDetails ? (
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.25, marginBottom: '6px' }}>
                  {meetingDetails.title}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  Host: <strong style={{ color: '#FFF' }}>{meetingDetails.hostName || 'Host'}</strong>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(16, 21, 34, 0.8)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 18px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Meeting ID:</span>
                    <span style={{ color: '#FFF', fontWeight: '700' }}>{formatMeetingId(meetingId)}</span>
                  </div>
                  {meetingDetails.passcode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Passcode:</span>
                      <span style={{ color: '#FFF', fontWeight: '700' }}>{meetingDetails.passcode}</span>
                    </div>
                  )}
                  {Boolean(meetingDetails.requireWaitingRoom) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--zoom-green-live)', marginTop: '2px', fontSize: '12px', fontWeight: '600' }}>
                      <CheckCircle2 size={13} /> Waiting Room Enabled (Host will admit)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  color: '#F87171',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '4px' }}>
                  <AlertCircle size={16} /> Instant Room Ready
                </div>
                {errorMsg || 'Meeting ID is ready. You will join as room host.'}
              </div>
            )}

            {/* Display Name Form */}
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  style={{ width: '100%', fontSize: '15px', fontWeight: '600' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'var(--zoom-blue-gradient)',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '16px',
                  fontWeight: '800',
                  boxShadow: 'var(--shadow-blue-glow)',
                  marginTop: '10px',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>Join Meeting Now</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '28px' }}>
            Encrypted with 256-bit AES Transport Security • Zoom Workspace
          </div>
        </div>
      </div>
    </div>
  );
}
