'use client';

import React, { useState } from 'react';
import { X, BarChart3, Plus, Check, Vote, Sparkles } from 'lucide-react';
import { Poll } from '@/types';

interface PollsModalProps {
  isOpen: boolean;
  onClose: () => void;
  polls: Poll[];
  currentUserId: string;
  isHost: boolean;
  onCreatePoll: (question: string, options: string[]) => void;
  onVotePoll: (pollId: string, optionId: string) => void;
}

export function PollsModal({
  isOpen,
  onClose,
  polls,
  currentUserId,
  isHost,
  onCreatePoll,
  onVotePoll,
}: PollsModalProps) {
  const [activeTab, setActiveTab] = useState<'polls' | 'create'>('polls');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) return;
    onCreatePoll(question.trim(), options.filter((o) => o.trim()));
    setQuestion('');
    setOptions(['Option 1', 'Option 2']);
    setActiveTab('polls');
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
        zIndex: 95,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-heavy animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(14, 113, 235, 0.15)',
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
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-toolbar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--zoom-blue-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>In-Meeting Polls & Q&A</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
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

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Header Action Tabs */}
          {isHost && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('polls')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: activeTab === 'polls' ? '#FFF' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'polls' ? 'var(--zoom-blue)' : 'rgba(255,255,255,0.05)',
                }}
              >
                Active Polls ({polls.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: activeTab === 'create' ? '#FFF' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'create' ? 'var(--zoom-blue)' : 'rgba(255,255,255,0.05)',
                }}
              >
                + Launch New Poll
              </button>
            </div>
          )}

          {activeTab === 'polls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {polls.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>
                  No active polls yet. {isHost ? 'Launch a poll to gather instant audience feedback!' : 'Waiting for host to launch a poll.'}
                </div>
              ) : (
                polls.map((poll) => (
                  <div
                    key={poll.id}
                    style={{
                      backgroundColor: 'rgba(16, 21, 34, 0.8)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFF', marginBottom: '14px' }}>
                      {poll.question}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {poll.options.map((opt) => {
                        const hasVoted = opt.votedUserIds.includes(currentUserId);
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                        return (
                          <button
                            key={opt.id}
                            onClick={() => onVotePoll(poll.id, opt.id)}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: hasVoted ? 'rgba(14, 113, 235, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                              border: hasVoted ? '1px solid var(--zoom-blue)' : '1px solid var(--border-subtle)',
                              textAlign: 'left',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Vote Progress Fill */}
                            <div
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${pct}%`,
                                backgroundColor: 'rgba(14, 113, 235, 0.15)',
                                transition: 'width 0.4s ease',
                              }}
                            />

                            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFF' }}>
                                {opt.text}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--zoom-blue-hover)' }}>
                                  {pct}% ({opt.votes})
                                </span>
                                {hasVoted && <Check size={14} color="var(--zoom-blue)" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
                      Total Votes: {poll.totalVotes}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'create' && isHost && (
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Poll Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Is Sprint 42 ready for deployment?"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Poll Options
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      required
                      style={{ width: '100%' }}
                    />
                  ))}
                </div>
              </div>

              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  style={{
                    fontSize: '12px',
                    color: 'var(--zoom-blue-hover)',
                    fontWeight: '700',
                    textAlign: 'left',
                  }}
                >
                  + Add Option
                </button>
              )}

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  background: 'var(--zoom-blue-gradient)',
                  color: '#FFF',
                  padding: '12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '800',
                  fontSize: '14px',
                  boxShadow: 'var(--shadow-blue-glow)',
                }}
              >
                Launch Poll to All Participants
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
