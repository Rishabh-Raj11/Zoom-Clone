'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, MessageSquare, ShieldCheck, Key } from 'lucide-react';
import { copyToClipboard, formatMeetingId } from '@/lib/utils';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingTitle?: string;
  passcode?: string;
}

export function InviteModal({
  isOpen,
  onClose,
  meetingId,
  meetingTitle = 'Zoom Meeting',
  passcode,
}: InviteModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!isOpen) return null;

  const rawId = meetingId.replace(/[\s-]/g, '');
  const formattedId = formatMeetingId(meetingId);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zoom-workplace-rishabh.vercel.app';
  const joinUrl = `${origin}/join/${rawId}`;

  const fullInviteText = `Topic: ${meetingTitle}
Join Zoom Meeting: ${joinUrl}

Meeting ID: ${formattedId}${passcode ? `\nPasscode: ${passcode}` : ''}

One tap mobile:
${joinUrl}`;

  const handleCopyCode = async () => {
    await copyToClipboard(rawId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    await copyToClipboard(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFull = async () => {
    await copyToClipboard(fullInviteText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(fullInviteText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Invitation: ${meetingTitle}`);
    const body = encodeURIComponent(fullInviteText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-heavy animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#111520',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '28px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFF', letterSpacing: '-0.4px', margin: 0 }}>
              Invite Participants
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0 0' }}>
              Share this meeting code or direct link to invite anyone
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Big Meeting Code Card */}
        <div
          style={{
            backgroundColor: 'rgba(14, 113, 235, 0.08)',
            border: '1px solid rgba(14, 113, 235, 0.3)',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Direct Meeting Code
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', fontFamily: 'monospace' }}>
              {formattedId}
            </span>
            <button
              onClick={handleCopyCode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                backgroundColor: copiedCode ? '#10B981' : 'var(--zoom-blue)',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Passcode Card */}
        {passcode && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={16} color="#F59E0B" />
              <span style={{ fontSize: '13px', color: '#94A3B8' }}>Meeting Passcode:</span>
            </div>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#F59E0B', letterSpacing: '1px' }}>
              {passcode}
            </span>
          </div>
        )}

        {/* Direct Link Card */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' }}>
            Direct Join Link
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <input
              type="text"
              readOnly
              value={joinUrl}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#E2E8F0',
                fontSize: '12px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: copiedLink ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Shares */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={handleShareWhatsApp}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              color: '#25D366',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <MessageSquare size={16} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleShareEmail}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Mail size={16} />
            <span>Email</span>
          </button>
        </div>

        {/* Full Invitation Button */}
        <button
          onClick={handleCopyFull}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '14px',
            backgroundColor: copiedFull ? '#10B981' : 'var(--zoom-blue-gradient)',
            color: '#FFF',
            border: 'none',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(14, 113, 235, 0.35)',
            transition: 'all 0.2s',
          }}
        >
          {copiedFull ? <Check size={16} /> : <Share2 size={16} />}
          <span>{copiedFull ? 'Full Invitation Copied to Clipboard!' : 'Copy Full Invitation'}</span>
        </button>
      </div>
    </div>
  );
}
