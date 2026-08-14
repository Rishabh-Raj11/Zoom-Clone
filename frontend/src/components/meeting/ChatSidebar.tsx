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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickEmojis = ['👍', '👏', '❤️', '🎉', '🔥', '🚀'];

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
        width: '360px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>In-Meeting Chat</span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              backgroundColor: 'rgba(14, 113, 235, 0.15)',
              color: 'var(--zoom-blue-hover)',
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

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          padding: '18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
              marginTop: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(14, 113, 235, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="var(--zoom-blue)" />
            </div>
            <span>No messages yet. Send a message to start the team conversation!</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isMe ? 'var(--zoom-blue-hover)' : 'var(--text-primary)',
                    }}
                  >
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  {msg.isDirect && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      <Lock size={10} /> Private
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatTimeOnly(msg.timestamp)}
                  </span>
                </div>

                <div
                  style={{
                    background: isMe ? 'var(--zoom-blue-gradient)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '13px',
                    lineHeight: '1.45',
                    maxWidth: '88%',
                    wordBreak: 'break-word',
                    boxShadow: isMe ? '0 4px 14px rgba(14, 113, 235, 0.3)' : 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Area */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(13, 17, 26, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Quick Emoji Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {quickEmojis.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => insertEmoji(e)}
              style={{
                fontSize: '14px',
                padding: '3px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(el) => (el.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(el) => (el.currentTarget.style.transform = 'scale(1)')}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Recipient Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: '600' }}>To:</span>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              color: '#FFF',
              flex: 1,
              fontWeight: '600',
            }}
          >
            <option value="everyone">Everyone in Meeting</option>
            {participants
              .filter((p) => p.id !== currentUserId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} (Direct Message)
                </option>
              ))}
          </select>
        </div>

        {/* Input & Send Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={recipientId === 'everyone' ? 'Send a message to everyone...' : 'Send direct private message...'}
            style={{
              flex: 1,
              padding: '9px 14px',
              fontSize: '13px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: inputText.trim() ? 'var(--zoom-blue-gradient)' : 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: inputText.trim() ? 'var(--shadow-blue-glow)' : 'none',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
