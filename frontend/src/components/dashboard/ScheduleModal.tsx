'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Lock,
  Shield,
  Video,
  Check,
  Sparkles,
  Sliders,
  Users,
} from 'lucide-react';
import { scheduleMeeting } from '@/lib/api';
import { Meeting } from '@/types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingScheduled: (meeting: Meeting) => void;
}

export function ScheduleModal({ isOpen, onClose, onMeetingScheduled }: ScheduleModalProps) {
  const [title, setTitle] = useState("Rishabh's Strategy & Sync Meeting");
  const [description, setDescription] = useState('');

  const defaultDate = new Date(Date.now() + 24 * 3600 * 1000);
  const defaultDateStr = defaultDate.toISOString().slice(0, 10);

  const [date, setDate] = useState(defaultDateStr);
  const [time, setTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passcode, setPasscode] = useState(Math.floor(100000 + Math.random() * 900000).toString());
  const [requireWaitingRoom, setRequireWaitingRoom] = useState(true);
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [hostVideoDefault, setHostVideoDefault] = useState(true);
  const [participantVideoDefault, setParticipantVideoDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const scheduledStart = new Date(`${date}T${time}:00`).toISOString();

      const created = await scheduleMeeting({
        title,
        description,
        scheduledStart,
        durationMinutes,
        passcode,
        requireWaitingRoom,
        allowScreenShare,
        hostVideoDefault,
        participantVideoDefault,
      });

      onMeetingScheduled(created);
      onClose();
    } catch (err: any) {
      console.error('Schedule error:', err);
      setError(err.message || 'Failed to schedule meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(124, 58, 237, 0.15)',
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
            padding: '22px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-toolbar)',
            backdropFilter: 'blur(20px)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--zoom-purple-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
              }}
            >
              <Calendar size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>Schedule Meeting</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generate invite link & calendar event</span>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
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

          {/* Topic */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Meeting Topic
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint 42 Planning & Architecture"
              required
              style={{ width: '100%', fontSize: '14px', fontWeight: '600' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Description & Agenda (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, agenda items, or links to materials..."
              rows={2}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Date, Time & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Security Box */}
          <div
            style={{
              backgroundColor: 'rgba(16, 21, 34, 0.8)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#FFF', marginBottom: '14px' }}>
              <Lock size={16} color="var(--zoom-blue)" /> Security & Access Controls
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                    Passcode
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Only authorized users can join</span>
                </div>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  style={{ width: '140px', letterSpacing: '2px', fontWeight: '700', textAlign: 'center' }}
                  maxLength={10}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requireWaitingRoom}
                  onChange={(e) => setRequireWaitingRoom(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--zoom-blue)' }}
                />
                <span>Enable Waiting Room (admit attendees individually)</span>
              </label>
            </div>
          </div>

          {/* Video Defaults */}
          <div
            style={{
              backgroundColor: 'rgba(16, 21, 34, 0.8)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#FFF', marginBottom: '14px' }}>
              <Video size={16} color="var(--zoom-blue)" /> Video Preferences
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Host Camera
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="hostVideo"
                      checked={hostVideoDefault}
                      onChange={() => setHostVideoDefault(true)}
                      style={{ accentColor: 'var(--zoom-blue)' }}
                    />
                    On
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="hostVideo"
                      checked={!hostVideoDefault}
                      onChange={() => setHostVideoDefault(false)}
                      style={{ accentColor: 'var(--zoom-blue)' }}
                    />
                    Off
                  </label>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Participant Camera
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="partVideo"
                      checked={participantVideoDefault}
                      onChange={() => setParticipantVideoDefault(true)}
                      style={{ accentColor: 'var(--zoom-blue)' }}
                    />
                    On
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="partVideo"
                      checked={!participantVideoDefault}
                      onChange={() => setParticipantVideoDefault(false)}
                      style={{ accentColor: 'var(--zoom-blue)' }}
                    />
                    Off
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
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
              disabled={isSubmitting}
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
              {isSubmitting ? 'Saving...' : 'Save & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
