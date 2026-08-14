'use client';

import React from 'react';
import { History, Calendar, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { Meeting } from '@/types';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface RecentMeetingsProps {
  meetings: Meeting[];
}

export function RecentMeetings({ meetings }: RecentMeetingsProps) {
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
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}
        >
          <History size={28} color="#94A3B8" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
          No previous meetings
        </h3>
        <p style={{ fontSize: '13px', color: '#94A3B8' }}>
          Meetings you end will appear here with history logs.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{meeting.title}</h4>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <CheckCircle size={10} /> Ended
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#94A3B8', fontSize: '12px' }}>
              <span>{formatDateTime(meeting.scheduled_start || meeting.created_at)}</span>
              <span>Duration: {meeting.duration_minutes} mins</span>
              <span>ID: {meeting.meeting_id}</span>
            </div>
          </div>

          <Link
            href={`/join/${meeting.meeting_id.replace(/\s/g, '')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} /> Reopen Room
          </Link>
        </div>
      ))}
    </div>
  );
}
