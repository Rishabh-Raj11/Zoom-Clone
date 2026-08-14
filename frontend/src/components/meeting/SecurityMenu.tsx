'use client';

import React, { useState } from 'react';
import { Shield, Lock, Unlock, Check, Users, MessageSquare, Share2, Edit3, Mic } from 'lucide-react';

interface SecurityMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  onLockMeeting: (locked: boolean) => void;
}

export function SecurityMenu({ isOpen, onClose, isHost, onLockMeeting }: SecurityMenuProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [allowShareScreen, setAllowShareScreen] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [allowRename, setAllowRename] = useState(true);
  const [allowUnmute, setAllowUnmute] = useState(true);

  if (!isOpen) return null;

  const handleToggleLock = () => {
    const nextState = !isLocked;
    setIsLocked(nextState);
    onLockMeeting(nextState);
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '82px',
        left: '200px',
        width: '280px',
        borderRadius: 'var(--radius-lg)',
        padding: '12px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 60,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Shield size={14} color="var(--zoom-blue)" /> Security Controls
      </div>

      {/* Lock Meeting Toggle */}
      <button
        onClick={handleToggleLock}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: isLocked ? 'var(--zoom-red)' : '#FFF',
          textAlign: 'left',
          backgroundColor: isLocked ? 'rgba(224, 40, 40, 0.15)' : 'transparent',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isLocked ? 'rgba(224, 40, 40, 0.2)' : 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isLocked ? 'rgba(224, 40, 40, 0.15)' : 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLocked ? <Lock size={15} color="var(--zoom-red)" /> : <Unlock size={15} />}
          <span>{isLocked ? 'Unlock Meeting' : 'Lock Meeting'}</span>
        </div>
        {isLocked && <Check size={14} color="var(--zoom-red)" />}
      </button>

      {/* Enable Waiting Room */}
      <button
        onClick={() => setEnableWaitingRoom(!enableWaitingRoom)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: '#FFF',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={15} />
          <span>Enable Waiting Room</span>
        </div>
        {enableWaitingRoom && <Check size={14} color="var(--zoom-blue)" />}
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', padding: '0 8px 4px 8px' }}>
        ALLOW PARTICIPANTS TO:
      </div>

      {/* Allow Screen Share */}
      <button
        onClick={() => setAllowShareScreen(!allowShareScreen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span>Share Screen</span>
        {allowShareScreen && <Check size={13} color="var(--zoom-blue)" />}
      </button>

      {/* Allow Chat */}
      <button
        onClick={() => setAllowChat(!allowChat)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span>Chat</span>
        {allowChat && <Check size={13} color="var(--zoom-blue)" />}
      </button>

      {/* Allow Rename */}
      <button
        onClick={() => setAllowRename(!allowRename)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span>Rename Themselves</span>
        {allowRename && <Check size={13} color="var(--zoom-blue)" />}
      </button>

      {/* Allow Unmute */}
      <button
        onClick={() => setAllowUnmute(!allowUnmute)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span>Unmute Themselves</span>
        {allowUnmute && <Check size={13} color="var(--zoom-blue)" />}
      </button>
    </div>
  );
}
