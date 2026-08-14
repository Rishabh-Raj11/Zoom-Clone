'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Copy,
  Play,
  Trash2,
  Key,
  Shield,
  Check,
  Plus,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { Meeting } from '@/types';
import { formatTimeOnly, getTimeUntil, copyToClipboard } from '@/lib/utils';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: string) => void;
  onOpenSchedule: () => void;
}

export function UpcomingMeetings({ meetings, onDeleteMeeting, onOpenSchedule }: UpcomingMeetingsProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyInvitation = async (meeting: Meeting) => {
    const text = `Topic: ${meeting.title}\nTime: ${meeting.scheduled_start ? new Date(meeting.scheduled_start).toLocaleString() : 'Now'}\n\nJoin Zoom Meeting:\n${meeting.join_url}\n\nMeeting ID: ${meeting.meeting_id}\nPasscode: ${meeting.passcode}`;
    await copyToClipboard(text);
    setCopiedId(meeting.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (meetings.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#161922',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(14, 113, 235, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <Calendar size={28} color="#0E71EB" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
          No upcoming meetings
        </h3>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
          Schedule a new meeting to send invitations and calendar reminders.
        </p>
        <button
          onClick={onOpenSchedule}
          style={{
            display: 'inline-flex',
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
          }}
        >
          <Plus size={16} /> Schedule a Meeting
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1C212E';
            e.currentTarget.style.borderColor = 'rgba(14, 113, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#161922';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          {/* Left: Time & Topic */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', minWidth: '320px', flex: '1 1 360px' }}>
            {/* Time Badge Column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '74px',
                padding: '8px 0',
                borderRadius: '8px',
                backgroundColor: 'rgba(14, 113, 235, 0.12)',
                color: '#2D8CFF',
                flexShrink: 0,
              }}
            >
              <span suppressHydrationWarning style={{ fontSize: '13px', fontWeight: '800' }}>
                {mounted && meeting.scheduled_start ? formatTimeOnly(meeting.scheduled_start) : 'Now'}
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                {meeting.duration_minutes} min
              </span>
            </div>

            {/* Meeting Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>
                  {meeting.title}
                </h4>
                <span
                  suppressHydrationWarning
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    color: '#10B981',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {mounted ? getTimeUntil(meeting.scheduled_start) : 'Upcoming'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#94A3B8', flexWrap: 'wrap' }}>
                <span>Meeting ID: <strong style={{ color: '#CBD5E1' }}>{meeting.meeting_id}</strong></span>
                <span>Passcode: <strong style={{ color: '#CBD5E1' }}>{meeting.passcode}</strong></span>
                {Boolean(meeting.require_waiting_room) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
                    <Shield size={12} /> Waiting Room
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Official Zoom Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => handleCopyInvitation(meeting)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: copiedId === meeting.id ? '#10B981' : '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {copiedId === meeting.id ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedId === meeting.id ? 'Copied' : 'Copy Invitation'}</span>
            </button>

            <button
              onClick={() => onDeleteMeeting(meeting.id)}
              title="Delete Meeting"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#94A3B8',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <Trash2 size={14} />
            </button>

            <Link
              href={`/join/${meeting.meeting_id.replace(/\s/g, '')}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0E71EB',
                color: '#FFFFFF',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(14, 113, 235, 0.4)',
              }}
            >
              <Play size={13} fill="#FFF" /> Start
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
