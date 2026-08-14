'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Copy,
  Play,
  Trash2,
  Plus,
  Shield,
  Check,
  User as UserIcon,
  Video,
  Key,
  Film,
  History,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Meeting, User, Recording } from '@/types';
import { formatTimeOnly, formatDateTime, copyToClipboard } from '@/lib/utils';
import { UpcomingMeetings } from '../dashboard/UpcomingMeetings';
import { RecentMeetings } from '../dashboard/RecentMeetings';
import { RecordingsList } from '../dashboard/RecordingsList';

interface MeetingsCalendarViewProps {
  currentUser: User;
  meetings: Meeting[];
  recordings: Recording[];
  onOpenSchedule: () => void;
  onDeleteMeeting: (id: string) => void;
}

export function MeetingsCalendarView({
  currentUser,
  meetings,
  recordings,
  onOpenSchedule,
  onDeleteMeeting,
}: MeetingsCalendarViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'previous' | 'pmi' | 'recordings'>('upcoming');
  const [copiedPMI, setCopiedPMI] = useState(false);

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');
  const recentMeetings = meetings.filter((m) => m.status === 'ended');
  const pmi = currentUser.pmi || '942 581 4920';
  const pmiPasscode = '482910';
  const pmiLink = `http://localhost:3001/join/${pmi.replace(/\s/g, '')}`;

  const handleCopyPMIInvite = async () => {
    const invite = `Topic: ${currentUser.name}'s Personal Meeting Room\n\nJoin Zoom Meeting:\n${pmiLink}\n\nMeeting ID: ${pmi}\nPasscode: ${pmiPasscode}`;
    await copyToClipboard(invite);
    setCopiedPMI(true);
    setTimeout(() => setCopiedPMI(false), 2500);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: '#11141D',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* LEFT SIDEBAR NAVIGATION */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#161922',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ padding: '0 8px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Meetings</h3>
            <button
              onClick={onOpenSchedule}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#0E71EB',
                color: '#FFF',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Schedule
            </button>
          </div>

          <button
            onClick={() => setActiveSubTab('upcoming')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: activeSubTab === 'upcoming' ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
              color: activeSubTab === 'upcoming' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSubTab === 'upcoming' ? '700' : '500',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} color={activeSubTab === 'upcoming' ? '#0E71EB' : '#94A3B8'} />
              <span>Upcoming</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
              {upcomingMeetings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('previous')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: activeSubTab === 'previous' ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
              color: activeSubTab === 'previous' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSubTab === 'previous' ? '700' : '500',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={16} color={activeSubTab === 'previous' ? '#0E71EB' : '#94A3B8'} />
              <span>Previous</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
              {recentMeetings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pmi')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: activeSubTab === 'pmi' ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
              color: activeSubTab === 'pmi' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSubTab === 'pmi' ? '700' : '500',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <UserIcon size={16} color={activeSubTab === 'pmi' ? '#0E71EB' : '#94A3B8'} />
            <span>Personal Room (PMI)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recordings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: activeSubTab === 'recordings' ? 'rgba(14, 113, 235, 0.18)' : 'transparent',
              color: activeSubTab === 'recordings' ? '#FFFFFF' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSubTab === 'recordings' ? '700' : '500',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Film size={16} color={activeSubTab === 'recordings' ? '#0E71EB' : '#94A3B8'} />
              <span>Cloud Recordings</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: '10px' }}>
              {recordings.length}
            </span>
          </button>
        </div>

        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', fontSize: '11px', color: '#94A3B8' }}>
          <div>Signed in as:</div>
          <strong style={{ color: '#FFF' }}>{currentUser.email}</strong>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', backgroundColor: '#0D1017' }}>
        {activeSubTab === 'upcoming' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>Upcoming Meetings</h2>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                  Manage scheduled meetings, share invitation links, or launch instantly.
                </p>
              </div>
              <button
                onClick={onOpenSchedule}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0E71EB',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(14, 113, 235, 0.4)',
                }}
              >
                <Plus size={16} /> Schedule a Meeting
              </button>
            </div>

            <UpcomingMeetings
              meetings={upcomingMeetings}
              onDeleteMeeting={onDeleteMeeting}
              onOpenSchedule={onOpenSchedule}
            />
          </div>
        )}

        {activeSubTab === 'previous' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
              Previous Meetings
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              Review past call records and restart expired meeting rooms.
            </p>
            <RecentMeetings meetings={recentMeetings} />
          </div>
        )}

        {activeSubTab === 'pmi' && (
          <div style={{ maxWidth: '680px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
              Personal Meeting Room
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px' }}>
              Your permanent personal room always uses this fixed ID and passcode.
            </p>

            <div
              style={{
                backgroundColor: '#161922',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0E71EB' }}
                />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFF' }}>
                    {currentUser.name}'s Personal Meeting Room
                  </h3>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
                    Permanent Meeting URL: <span style={{ color: '#0E71EB' }}>{pmiLink}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>Personal Meeting ID (PMI)</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', letterSpacing: '0.5px', marginTop: '4px' }}>
                    {pmi}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>Passcode</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#FFF', letterSpacing: '0.5px', marginTop: '4px' }}>
                    {pmiPasscode}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <Link
                  href={`/join/${pmi.replace(/\s/g, '')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0E71EB',
                    color: '#FFF',
                    padding: '10px 24px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(14, 113, 235, 0.4)',
                  }}
                >
                  <Play size={15} fill="#FFF" /> Start Meeting
                </Link>

                <button
                  onClick={handleCopyPMIInvite}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: copiedPMI ? '#10B981' : '#FFF',
                    padding: '10px 18px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedPMI ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedPMI ? 'Invitation Copied!' : 'Copy Invitation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'recordings' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>
              Cloud Recordings
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              Stream, download, or share high-definition cloud recordings of finished meetings.
            </p>
            <RecordingsList recordings={recordings} />
          </div>
        )}
      </div>
    </div>
  );
}
