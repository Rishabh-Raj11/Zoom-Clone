'use client';

import React, { useState } from 'react';
import {
  X,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserPlus,
  VolumeX,
  MoreVertical,
  UserX,
  Shield,
  Check,
} from 'lucide-react';
import { Participant } from '@/types';
import { copyToClipboard } from '@/lib/utils';

interface ParticipantsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  currentUserId: string;
  isCurrentUserHost: boolean;
  meetingId: string;
  passcode?: string;
  onMuteAll: () => void;
  onMuteUser: (userId: string) => void;
  onKickUser: (userId: string) => void;
  onOpenInvite?: () => void;
}

export function ParticipantsSidebar({
  isOpen,
  onClose,
  participants,
  currentUserId,
  isCurrentUserHost,
  meetingId,
  passcode,
  onMuteAll,
  onMuteUser,
  onKickUser,
  onOpenInvite,
}: ParticipantsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = participants.filter((p) =>
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyInvite = async () => {
    if (onOpenInvite) {
      onOpenInvite();
      return;
    }
    const inviteUrl = `${window.location.origin}/join/${meetingId.replace(/\s/g, '')}`;
    const text = `Join Zoom Meeting:\n${inviteUrl}\n\nMeeting ID: ${meetingId}${passcode ? `\nPasscode: ${passcode}` : ''}`;
    await copyToClipboard(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div
      className="glass-panel-heavy animate-fade-in"
      style={{
        width: '340px',
        borderLeft: '1px solid var(--border-medium)',
        borderTop: 'none',
        borderBottom: 'none',
        borderRight: 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 45,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>
          Participants ({participants.length})
        </span>
        <button
          onClick={onClose}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a participant..."
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '12px',
              height: '36px',
              fontSize: '13px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        </div>
      </div>

      {/* Participant List */}
      <div style={{ flex: 1, padding: '12px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((p) => {
          const isMe = p.id === currentUserId;
          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--zoom-blue-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '800',
                      color: '#FFF',
                    }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.displayName} {isMe ? '(You)' : ''}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {p.role === 'host' ? 'Host, Me' : p.role === 'co-host' ? 'Co-host' : 'Participant'}
                  </span>
                </div>
              </div>

              {/* Status Icons & Action Menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {p.isHandRaised && <Hand size={15} color="#F59E0B" />}
                {p.isMuted ? <MicOff size={15} color="var(--zoom-red)" /> : <Mic size={15} color="var(--zoom-green-live)" />}
                {p.isVideoOff ? <VideoOff size={15} color="var(--zoom-red)" /> : <Video size={15} color="var(--zoom-blue-hover)" />}

                {/* Host Action Dropdown for other participants */}
                {isCurrentUserHost && !isMe && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setMenuOpenUserId(menuOpenUserId === p.id ? null : p.id)}
                      style={{
                        padding: '4px',
                        color: 'var(--text-muted)',
                        borderRadius: '4px',
                      }}
                    >
                      <MoreVertical size={15} />
                    </button>

                    {menuOpenUserId === p.id && (
                      <div
                        className="glass-panel-heavy animate-fade-in"
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '28px',
                          width: '160px',
                          borderRadius: 'var(--radius-md)',
                          padding: '6px',
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 60,
                        }}
                      >
                        <button
                          onClick={() => {
                            onMuteUser(p.id);
                            setMenuOpenUserId(null);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            fontSize: '12px',
                            color: '#FFF',
                            textAlign: 'left',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <VolumeX size={14} /> Mute User
                        </button>
                        <button
                          onClick={() => {
                            onKickUser(p.id);
                            setMenuOpenUserId(null);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 10px',
                            fontSize: '12px',
                            color: 'var(--zoom-red)',
                            textAlign: 'left',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <UserX size={14} /> Remove User
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Host Actions */}
      <div
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(13, 17, 26, 0.95)',
          display: 'flex',
          gap: '10px',
        }}
      >
        <button
          onClick={handleCopyInvite}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: copiedInvite ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            color: copiedInvite ? 'var(--zoom-green-live)' : '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            fontWeight: '700',
          }}
        >
          {copiedInvite ? <Check size={15} /> : <UserPlus size={15} />}
          <span>{copiedInvite ? 'Copied' : 'Invite'}</span>
        </button>

        {isCurrentUserHost && (
          <button
            onClick={onMuteAll}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--zoom-red)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            <VolumeX size={15} />
            <span>Mute All</span>
          </button>
        )}
      </div>
    </div>
  );
}
