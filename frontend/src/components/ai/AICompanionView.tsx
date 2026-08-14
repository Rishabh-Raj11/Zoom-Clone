'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle,
  FileText,
  Mail,
  ListTodo,
  Calendar,
  Copy,
  Check,
  Zap,
  Key,
  HelpCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { User } from '@/types';
import { copyToClipboard } from '@/lib/utils';
import { queryAICompanion, testOpenAIKey } from '@/lib/api';

interface AICompanionViewProps {
  currentUser: User;
}

interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionItems?: string[];
  keyTopics?: string[];
  source?: string;
}

export function AICompanionView({ currentUser }: AICompanionViewProps) {
  const [prompt, setPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('zoom_openai_api_key') || '';
      const savedModel = localStorage.getItem('zoom_openai_model') || 'gpt-4o-mini';
      setCustomApiKey(savedKey);
      setSelectedModel(savedModel);
    }
  }, []);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai-init',
      sender: 'ai',
      text: `Hello ${currentUser.name.split(' ')[0]}! I am your **Zoom AI Companion**.

I am connected to your workspace to help you:
- 📋 **Summarize meetings & discussion notes**
- ✅ **Extract actionable task items with owners & deadlines**
- ✉️ **Draft professional follow-up emails with meeting links**
- 📅 **Generate structured sprint planning & client agendas**
- 💬 **Answer any technical or project questions**

What would you like assistance with today?`,
      timestamp: 'Just now',
      source: 'local-engine',
    },
  ]);

  const quickPrompts = [
    { label: 'Summarize Last Meeting', icon: FileText, query: 'Summarize our last sprint engineering meeting in detail', context: 'summary' as const },
    { label: 'Extract Action Items', icon: ListTodo, query: 'Extract all team action items, owners, and deadlines', context: 'action_items' as const },
    { label: 'Draft Follow-Up Email', icon: Mail, query: 'Draft a stakeholder follow-up email with Zoom PMI links', context: 'email' as const },
    { label: 'Generate 45m Agenda', icon: Calendar, query: 'Generate an agile 45-minute sprint planning agenda', context: 'agenda' as const },
  ];

  const handleTestAndSaveKey = async () => {
    if (!customApiKey.trim()) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zoom_openai_api_key');
      }
      setTestResult(null);
      setShowKeyInput(false);
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    const res = await testOpenAIKey(customApiKey.trim());
    setTestResult(res);
    setIsTestingKey(false);

    if (res.success) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zoom_openai_api_key', customApiKey.trim());
        localStorage.setItem('zoom_openai_model', selectedModel);
      }
      setIsKeySaved(true);
      setTimeout(() => {
        setIsKeySaved(false);
        setShowKeyInput(false);
      }, 1500);
    }
  };

  const handleSend = async (textToSend?: string, contextType?: 'summary' | 'action_items' | 'email' | 'agenda' | 'general') => {
    const query = textToSend || prompt;
    if (!query.trim()) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsThinking(true);

    try {
      const result = await queryAICompanion({
        prompt: query.trim(),
        userName: currentUser.name,
        meetingTitle: 'Sprint 42 Engineering & Platform Sync',
        contextType: contextType || 'general',
        apiKey: customApiKey.trim() || undefined,
        model: selectedModel,
      });

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionItems: result.actionItems,
        keyTopics: result.keyTopics,
        source: result.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Failed to query AI Companion:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#11141D',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* AI Header */}
      <div
        style={{
          height: '56px',
          backgroundColor: '#161922',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="#38BDF8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>Zoom AI Companion</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  backgroundColor: customApiKey ? 'rgba(16, 185, 129, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                  color: customApiKey ? '#10B981' : '#38BDF8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {customApiKey ? <ShieldCheck size={12} /> : null}
                {customApiKey ? `OPENAI CONNECTED (${selectedModel})` : 'BUILT-IN AI ACTIVE'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>AI intelligence for meetings, chats, notes & follow-ups</div>
          </div>
        </div>

        {/* Custom API Key toggle button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            title="Configure OpenAI LLM API Key"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: customApiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              color: customApiKey ? '#10B981' : '#CBD5E1',
              border: customApiKey ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.12)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Key size={13} color={customApiKey ? '#10B981' : '#38BDF8'} />
            <span>{customApiKey ? 'OpenAI Key Active' : 'Add OpenAI API Key'}</span>
          </button>
        </div>
      </div>

      {/* Custom API Key Drawer */}
      {showKeyInput && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#1E2330',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="password"
              placeholder="Paste your OpenAI API Key (sk-...)"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              style={{
                flex: 1,
                height: '36px',
                padding: '0 14px',
                fontSize: '12.5px',
                borderRadius: '6px',
                backgroundColor: '#0D1017',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFF',
                fontFamily: 'monospace',
              }}
            />

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                height: '36px',
                padding: '0 10px',
                backgroundColor: '#0D1017',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#FFF',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Fast)</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>

            <button
              onClick={handleTestAndSaveKey}
              disabled={isTestingKey}
              style={{
                backgroundColor: '#0E71EB',
                color: '#FFF',
                border: 'none',
                padding: '0 16px',
                height: '36px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Zap size={14} className={isTestingKey ? 'animate-spin' : ''} />
              <span>{isTestingKey ? 'Testing...' : isKeySaved ? 'Saved!' : 'Test & Save'}</span>
            </button>
          </div>

          {testResult && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: testResult.success ? '#10B981' : '#EF4444',
              }}
            >
              {testResult.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Messages Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: isAI ? '90%' : '75%',
                alignSelf: isAI ? 'flex-start' : 'flex-end',
                flexDirection: isAI ? 'row' : 'row-reverse',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isAI ? 'rgba(56, 189, 248, 0.15)' : '#0E71EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isAI ? <Bot size={20} color="#38BDF8" /> : <span style={{ color: '#FFF', fontWeight: '700', fontSize: '13px' }}>{currentUser.name[0]}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: isAI ? '#38BDF8' : '#FFF' }}>
                    {isAI ? (msg.source?.includes('openai') ? `AI Companion (${selectedModel})` : 'Zoom AI Companion') : currentUser.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{msg.timestamp}</span>
                </div>

                <div
                  style={{
                    backgroundColor: isAI ? '#161922' : '#0E71EB',
                    color: '#FFFFFF',
                    padding: '14px 18px',
                    borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    fontSize: '13.5px',
                    lineHeight: '1.6',
                    border: isAI ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.text}

                  {/* Action items badge list if any */}
                  {Boolean(msg.actionItems && msg.actionItems.length > 0) && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Action Items Tracked:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {msg.actionItems?.map((item, i) => (
                          <div key={i} style={{ fontSize: '12px', color: '#CBD5E1', paddingLeft: '12px', position: 'relative' }}>
                            • {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isAI && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    style={{
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: copiedId === msg.id ? '#10B981' : '#64748B',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38BDF8', fontSize: '13px' }}>
            <Zap size={16} className="animate-spin" />
            <span>AI Companion is generating intelligent response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(qp.query, qp.context)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#CBD5E1',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
            >
              <Icon size={13} color="#38BDF8" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div style={{ padding: '12px 20px 16px 20px', backgroundColor: '#161922', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0E1118',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '4px 8px 4px 14px',
          }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI Companion anything about your meetings, transcripts, or tasks..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFF',
              fontSize: '13px',
              height: '38px',
            }}
          />

          <button
            type="submit"
            disabled={!prompt.trim() || isThinking}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: prompt.trim() ? '#0E71EB' : 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: prompt.trim() ? 'pointer' : 'default',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
