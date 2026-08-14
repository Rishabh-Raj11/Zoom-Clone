'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Video,
  Mic,
  Volume2,
  Shield,
  User,
  Image,
  Monitor,
  Check,
  Sparkles,
  Zap,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { User as UserType } from '@/types';
import { testOpenAIKey } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'background' | 'ai' | 'profile' | 'general'>('ai');
  const [hdVideo, setHdVideo] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState<'auto' | 'low' | 'medium' | 'high'>('auto');
  const [selectedBg, setSelectedBg] = useState<'none' | 'blur' | 'office' | 'nature' | 'penthouse'>('none');

  // AI Settings State
  const [openAiKey, setOpenAiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('zoom_openai_api_key') || '';
      const savedModel = localStorage.getItem('zoom_openai_model') || 'gpt-4o-mini';
      setOpenAiKey(savedKey);
      setSelectedModel(savedModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { key: 'ai', label: 'AI Companion & LLM', icon: Sparkles },
    { key: 'video', label: 'Video', icon: Video },
    { key: 'audio', label: 'Audio', icon: Mic },
    { key: 'background', label: 'Background & Effects', icon: Image },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'general', label: 'General', icon: Settings },
  ];

  const handleTestKey = async () => {
    if (!openAiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an OpenAI API key first.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    const res = await testOpenAIKey(openAiKey.trim());
    setTestResult(res);
    setIsTestingKey(false);
  };

  const handleSaveAISettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoom_openai_api_key', openAiKey.trim());
      localStorage.setItem('zoom_openai_model', selectedModel);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleRemoveKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zoom_openai_api_key');
      setOpenAiKey('');
      setTestResult(null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
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
        zIndex: 95,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-heavy animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '820px',
          height: '600px',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-toolbar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--zoom-blue)" />
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFF' }}>Zoom Preferences & Settings</span>
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
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Navigation Sidebar */}
          <div
            style={{
              width: '240px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRight: '1px solid var(--border-subtle)',
              padding: '16px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--zoom-blue)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={16} color={isActive ? '#FFF' : tab.key === 'ai' ? '#38BDF8' : 'var(--text-muted)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Tab Content Panel */}
          <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
            {/* AI COMPANION & LLM SETTINGS */}
            {activeTab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#38BDF8" />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>OpenAI & AI Companion Configuration</h3>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Connect your OpenAI API Key for GPT-4o-mini / GPT-4o live meeting summarization, smart follow-ups, and action item tracking.
                  </p>
                </div>

                {/* API Key Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={14} color="#38BDF8" />
                    <span>OpenAI API Key (sk-...)</span>
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-proj-..."
                      value={openAiKey}
                      onChange={(e) => setOpenAiKey(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 44px 0 14px',
                        backgroundColor: '#0D1017',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '13px',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                      }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#E2E8F0' }}>
                    Model Selection
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                      height: '40px',
                      padding: '0 12px',
                      backgroundColor: '#0D1017',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Ultra Fast & Cost Effective)</option>
                    <option value="gpt-4o">gpt-4o (High Intelligence Multimodal)</option>
                    <option value="gpt-4-turbo">gpt-4-turbo (Advanced Reasoning)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy Standard)</option>
                  </select>
                </div>

                {/* Action Buttons: Test Connection & Save */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={handleTestKey}
                    disabled={isTestingKey || !openAiKey.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38BDF8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: openAiKey.trim() ? 'pointer' : 'default',
                    }}
                  >
                    <Zap size={14} className={isTestingKey ? 'animate-spin' : ''} />
                    <span>{isTestingKey ? 'Testing OpenAI...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSaveAISettings}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      backgroundColor: '#0E71EB',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={14} />
                    <span>{isSaved ? 'Saved Successfully!' : 'Save Settings'}</span>
                  </button>

                  {openAiKey && (
                    <button
                      onClick={handleRemoveKey}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#EF4444',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Remove Key
                    </button>
                  )}
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      color: testResult.success ? '#10B981' : '#EF4444',
                      fontSize: '12px',
                    }}
                  >
                    {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Engine Status Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#FFF' }}>
                    <Lock size={15} color="#10B981" />
                    <span>Dual AI Architecture:</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.5' }}>
                    • If an OpenAI key is provided, all prompts and meeting summaries are processed by your OpenAI API directly.<br />
                    • If no key is set, the system automatically uses the high-performance local AI engine with zero setup required.
                  </p>
                </div>
              </div>
            )}

            {/* VIDEO SETTINGS */}
            {activeTab === 'video' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Video Preferences</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure camera resolution, mirror, and HD streaming</span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#000',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Video size={20} color="var(--zoom-blue)" />
                    <span>Camera Preview Active (720p HD)</span>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={hdVideo}
                    onChange={(e) => setHdVideo(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }}
                  />
                  <span>Enable HD 1080p Video Mode</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={mirrorVideo}
                    onChange={(e) => setMirrorVideo(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }}
                  />
                  <span>Mirror my video</span>
                </label>
              </div>
            )}

            {/* AUDIO SETTINGS */}
            {activeTab === 'audio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Audio & Microphone</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Background noise suppression and speaker testing</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                    Suppress Background Noise
                  </label>
                  <select
                    value={noiseSuppression}
                    onChange={(e) => setNoiseSuppression(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="auto">Auto (Recommended - AI Balanced)</option>
                    <option value="low">Low (Faint background sounds)</option>
                    <option value="medium">Medium (Computer fan, pen taps)</option>
                    <option value="high">High (Typing, barking, loud room)</option>
                  </select>
                </div>
              </div>
            )}

            {/* BACKGROUND & EFFECTS */}
            {activeTab === 'background' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Virtual Backgrounds</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select an AI background or blur effect</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'blur', label: 'Blur Background' },
                    { id: 'office', label: 'Modern Office' },
                    { id: 'nature', label: 'San Francisco' },
                    { id: 'penthouse', label: 'Penthouse View' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBg(bg.id as any)}
                      style={{
                        padding: '16px 12px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: selectedBg === bg.id ? 'rgba(14, 113, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: selectedBg === bg.id ? '2px solid var(--zoom-blue)' : '1px solid var(--border-subtle)',
                        color: selectedBg === bg.id ? '#FFF' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Host Profile</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Personal details and licensing</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: '800', color: '#FFF' }}>{user.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--zoom-blue-hover)',
                        backgroundColor: 'rgba(14, 113, 235, 0.15)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-block',
                        marginTop: '6px',
                      }}
                    >
                      Enterprise Pro Licensed Host
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                      Personal Meeting ID (PMI)
                    </label>
                    <input type="text" readOnly value={user.pmi || "942 581 4920"} style={{ width: '100%', color: 'var(--text-secondary)', fontWeight: '600' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                      Account Plan
                    </label>
                    <input type="text" readOnly value="Enterprise Workplace" style={{ width: '100%', color: 'var(--text-secondary)', fontWeight: '600' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                      Member Since (Signup Date)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Active Member'}
                      style={{ width: '100%', color: '#10B981', fontWeight: '600' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                      Last Login Date & Time
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      style={{ width: '100%', color: '#38BDF8', fontWeight: '600' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* GENERAL */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>General Preferences</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Startup behavior and window controls</span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }} />
                  <span>Start Zoom when I boot Windows</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }} />
                  <span>Use dual monitors mode</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }} />
                  <span>Enter full screen automatically when joining a meeting</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
