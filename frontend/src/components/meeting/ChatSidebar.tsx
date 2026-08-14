'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Lock, Users, Sparkles } from 'lucide-react';
import { ChatMessage, Participant } from '@/types';
import { formatTimeOnly } from '@/lib/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  participants: Participant[];
  currentUserId: string;
  onSendMessage: (text: string, targetId?: string) => void;
}

export function ChatSidebar({
  isOpen,
  onClose,
  messages,
  participants,
  currentUserId,
  onSendMessage,
}: ChatSidebarProps) {
  const [inputText, setInputText] = useState('');
  const [recipientId, setRecipientId] = useState<string>('everyone');
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickEmojis = ['👍', '👏', '❤️', '🎉', '🔥', '🚀'];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), recipientId === 'everyone' ? undefined : recipientId);
    setInputText('');
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => `${prev} ${emoji} `);
  };

  return (
    <div
      className="glass-panel-heavy animate-fade-in"
      style={{
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        right: 0,
        bottom: 0,
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '100vw' : '360px',
        height: '100%',
        backgroundColor: '#111520',
        borderLeft: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 75,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#171D2B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>In-Meeting Chat</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: 'var(--zoom-blue)',
              color: '#FFF',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Live
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Recipient Selector (Direct Message / Everyone) */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>To:</span>
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            color: '#FFFFFF',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '600',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="everyone">Everyone (Public in meeting)</option>
          {participants
            .filter((p) => p.id !== currentUserId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                🔒 Direct: {p.displayName} {p.role === 'host' ? '(Host)' : ''}
              </option>
            ))}
        </select>
      </div>

      {/* Messages Scroll View */}
      <div
        className="zoom-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '8px',
              padding: '20px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} color="var(--text-muted)" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFF' }}>No messages yet</span>
            <span style={{ fontSize: '12px' }}>Send a message to everyone or start a private direct chat.</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isDirect = Boolean(msg.targetId || msg.recipientId || msg.isDirect);

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender Tag & Timestamp */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: '700', color: isMe ? 'var(--zoom-blue)' : '#FFF' }}>
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  {isDirect && (
                    <span
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: '800',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Lock size={9} /> Direct
                    </span>
                  )}
                  <span>{formatTimeOnly(msg.timestamp)}</span>
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    backgroundColor: isMe
                      ? 'var(--zoom-blue)'
                      : isDirect
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: isDirect ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    wordBreak: 'break-word',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {msg.content || msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => insertEmoji(emoji)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Box Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          backgroundColor: '#171D2B',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type message to ${recipientId === 'everyone' ? 'everyone' : 'direct recipient'}...`}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#FFFFFF',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          style={{
            backgroundColor: inputText.trim() ? 'var(--zoom-blue)' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
