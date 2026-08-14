'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function JoinIndexPage() {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) return;
    let clean = meetingInput.trim();
    if (clean.includes('/join/')) {
      clean = clean.split('/join/')[1].split('?')[0];
    }
    clean = clean.replace(/[\s-]/g, '');
    router.push(`/join/${clean}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}
      >
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '24px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--zoom-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Video size={20} color="#FFF" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>zoom</span>
        </Link>

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>
          Join a Meeting
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Enter the 10-digit Meeting ID or Personal Link provided by the host.
        </p>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            value={meetingInput}
            onChange={(e) => setMeetingInput(e.target.value)}
            placeholder="e.g. 942 581 4920"
            required
            autoFocus
            style={{ width: '100%', fontSize: '15px', textAlign: 'center' }}
          />

          <button
            type="submit"
            disabled={!meetingInput.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--zoom-blue)',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '15px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(14, 113, 235, 0.4)',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
