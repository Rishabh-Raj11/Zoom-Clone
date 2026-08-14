'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Copy, Check, Calendar, Clock, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Meeting } from '@/types';
import { formatTimeOnly, getTimeUntil, copyToClipboard } from '@/lib/utils';

interface HeroClockProps {
  userName: string;
  nextMeeting: Meeting | null;
}

const WALLPAPERS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80', // Mountain landscape
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80', // Forest fog
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80', // Starry night mountains
];

export function HeroClock({ userName, nextMeeting }: HeroClockProps) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState({ timeStr: '', dateStr: '' });
  const [copied, setCopied] = useState(false);
  const [wallpaperIdx, setWallpaperIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      setTime({ timeStr, dateStr });
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = async () => {
    if (!nextMeeting) return;
    const text = `Join Zoom Meeting:\n${nextMeeting.join_url}\n\nMeeting ID: ${nextMeeting.meeting_id}\nPasscode: ${nextMeeting.passcode}`;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCycleWallpaper = () => {
    setWallpaperIdx((idx) => (idx + 1) % WALLPAPERS.length);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 32px',
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.75) 100%), url('${WALLPAPERS[wallpaperIdx]}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        userSelect: 'none',
      }}
    >
      {/* Top Bar: Wallpaper Switcher */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCycleWallpaper}
          title="Change background wallpaper"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ImageIcon size={13} /> Change Wallpaper
        </button>
      </div>

      {/* Center: Big Digital Clock & Date */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          suppressHydrationWarning
          style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: '-1.5px',
            lineHeight: 1,
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
        >
          {mounted ? time.timeStr : '12:00 PM'}
        </div>
        <div
          suppressHydrationWarning
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.85)',
            marginTop: '8px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {mounted ? time.dateStr : 'Loading...'}
        </div>
      </div>

      {/* Bottom: Next Meeting Banner inside Wallpaper Card */}
      {nextMeeting ? (
        <div
          style={{
            backgroundColor: 'rgba(15, 20, 30, 0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '12px 18px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#0E71EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={20} color="#FFF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {nextMeeting.title}
                </span>
                <span
                  suppressHydrationWarning
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {mounted ? getTimeUntil(nextMeeting.scheduled_start) : 'Upcoming'}
                </span>
              </div>
              <span suppressHydrationWarning style={{ fontSize: '12px', color: '#94A3B8' }}>
                {mounted ? formatTimeOnly(nextMeeting.scheduled_start) : ''} • ID: {nextMeeting.meeting_id}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: copied ? '#10B981' : '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <Link
              href={`/join/${nextMeeting.meeting_id.replace(/\s/g, '')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0E71EB',
                color: '#FFFFFF',
                padding: '7px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(14, 113, 235, 0.4)',
              }}
            >
              <Play size={13} fill="#FFF" /> Start
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.75)',
            alignSelf: 'flex-start',
          }}
        >
          No upcoming meetings for today
        </div>
      )}
    </div>
  );
}
