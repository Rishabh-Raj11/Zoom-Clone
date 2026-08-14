'use client';

import React, { useState } from 'react';
import {
  Film,
  Plus,
  Play,
  Share2,
  Copy,
  Clock,
  Eye,
  Check,
  Sparkles,
  Download,
  X,
  Video,
  Mic,
} from 'lucide-react';
import { User } from '@/types';

interface Clip {
  id: string;
  title: string;
  duration: string;
  views: number;
  createdAt: string;
  thumbnailUrl: string;
  author: string;
  authorAvatar: string;
  summary: string;
  videoUrl?: string;
}

const SAMPLE_CLIPS: Clip[] = [
  {
    id: 'clip-1',
    title: 'Sprint 42 Architecture Demo & Code Walkthrough',
    duration: '03:42',
    views: 34,
    createdAt: '2 hours ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    author: 'Rishabh',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    summary: 'Demonstrating the new 100% Zoom interface, active speaker layout, live polls, and SQLite persistent auth.',
  },
  {
    id: 'clip-2',
    title: 'Design System & Component Tokens Overview',
    duration: '02:15',
    views: 89,
    createdAt: 'Yesterday',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    author: 'Ananya Iyer',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    summary: 'Walkthrough of dark mode palette tokens, glassmorphic panels, and responsive Zoom toolbar styling.',
  },
  {
    id: 'clip-3',
    title: 'WebSocket Signaling Latency & Stress Benchmark',
    duration: '04:10',
    views: 120,
    createdAt: '3 days ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    author: 'Aarav Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    summary: 'Stress test benchmarks showing 10,000 WebSocket packets delivered with zero frame drops.',
  },
];

interface ClipsLibraryViewProps {
  currentUser: User;
}

export function ClipsLibraryView({ currentUser }: ClipsLibraryViewProps) {
  const [clips, setClips] = useState<Clip[]>(SAMPLE_CLIPS);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (clipId: string) => {
    setCopiedId(clipId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      setIsRecording(false);
      setIsRecordingModalOpen(false);

      const newClip: Clip = {
        id: `clip-${Date.now()}`,
        title: `Quick Screen Recording by ${currentUser.name}`,
        duration: '00:15',
        views: 1,
        createdAt: 'Just now',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
        author: currentUser.name,
        authorAvatar: currentUser.avatar_url || '',
        summary: 'Recorded video clip with screen capture and microphone audio track.',
      };
      setClips((prev) => [newClip, ...prev]);
    }, 5000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: '#11141D',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
            Zoom Clips
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
            Record short video messages and screen walkthroughs to share asynchronously.
          </p>
        </div>

        <button
          onClick={() => setIsRecordingModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#0E71EB',
            color: '#FFFFFF',
            padding: '9px 20px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(14, 113, 235, 0.4)',
          }}
        >
          <Plus size={16} /> Create Clip
        </button>
      </div>

      {/* Clips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {clips.map((clip) => (
          <div
            key={clip.id}
            onClick={() => setSelectedClip(clip)}
            style={{
              backgroundColor: '#161922',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#0E71EB';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Video Thumbnail with Duration Badge */}
            <div
              style={{
                height: '180px',
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${clip.thumbnailUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(14, 113, 235, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <Play size={20} fill="#FFF" color="#FFF" style={{ marginLeft: '3px' }} />
              </div>

              {/* Duration Badge */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {clip.duration}
              </span>
            </div>

            {/* Clip Info */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.3 }}>{clip.title}</h4>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px', lineHeight: 1.4 }}>{clip.summary}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={clip.authorAvatar}
                    alt={clip.author}
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>{clip.author}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Eye size={12} /> {clip.views}
                  </span>
                  <span>{clip.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECORDING MODAL */}
      {isRecordingModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: '420px',
              backgroundColor: '#1E2330',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Film size={20} color="#0E71EB" />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFF' }}>Record New Zoom Clip</h3>
              </div>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', textAlign: 'center' }}>
              {isRecording ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Recording... {recordingSeconds}s</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Capturing screen and audio...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '16px', color: '#94A3B8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Video size={16} /> Screen + Cam</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mic size={16} /> Default Mic</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Ready to capture high-definition async video.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsRecordingModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'transparent', color: '#94A3B8', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFF',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  cursor: isRecording ? 'default' : 'pointer',
                }}
              >
                {isRecording ? 'Capturing...' : 'Start Recording'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIP PLAYER MODAL */}
      {selectedClip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 85,
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              backgroundColor: '#1E2330',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFF' }}>{selectedClip.title}</h3>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>By {selectedClip.author} • {selectedClip.createdAt}</span>
              </div>
              <button onClick={() => setSelectedClip(null)} style={{ backgroundColor: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Video Player Mock */}
            <div
              style={{
                height: '360px',
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url('${selectedClip.thumbnailUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0E71EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(14, 113, 235, 0.6)',
                }}
              >
                <Play size={28} fill="#FFF" color="#FFF" style={{ marginLeft: '4px' }} />
              </div>
            </div>

            {/* AI Summary and Controls */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#38BDF8', fontWeight: '700' }}>
                <Sparkles size={14} /> AI Generated Clip Summary
              </div>
              <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: '1.5' }}>
                {selectedClip.summary}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
                <button
                  onClick={() => handleCopyLink(selectedClip.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: copiedId === selectedClip.id ? '#10B981' : '#FFF',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedId === selectedClip.id ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === selectedClip.id ? 'Link Copied!' : 'Copy Share Link'}</span>
                </button>

                <button
                  onClick={() => setSelectedClip(null)}
                  style={{
                    backgroundColor: '#0E71EB',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
