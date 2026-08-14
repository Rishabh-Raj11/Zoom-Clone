'use client';

import React, { useState } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Share2,
  ChevronDown,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface ActionCardsProps {
  onNewMeeting: (startWithVideo: boolean) => void;
  onOpenJoin: () => void;
  onOpenSchedule: () => void;
  onOpenShareScreen: () => void;
  isLoadingInstant?: boolean;
}

export function ActionCards({
  onNewMeeting,
  onOpenJoin,
  onOpenSchedule,
  onOpenShareScreen,
  isLoadingInstant = false,
}: ActionCardsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startWithVideo, setStartWithVideo] = useState(true);
  const [usePMI, setUsePMI] = useState(false);
  const [copiedPMI, setCopiedPMI] = useState(false);

  const pmi = '942 581 4920';

  const handleCopyPMI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(pmi);
    setCopiedPMI(true);
    setTimeout(() => setCopiedPMI(false), 2000);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {/* 1. NEW MEETING (Iconic Zoom Orange Tile) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            width: '124px',
            height: '124px',
            borderRadius: '28px',
            backgroundColor: '#FF7426',
            boxShadow: '0 8px 24px rgba(255, 116, 38, 0.35)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 116, 38, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 116, 38, 0.35)';
          }}
        >
          {/* Main Clickable Area */}
          <button
            onClick={() => onNewMeeting(startWithVideo)}
            disabled={isLoadingInstant}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <Video size={48} color="#FFFFFF" strokeWidth={2.2} />
          </button>

          {/* Split Dropdown Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            style={{
              width: '32px',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              border: 'none',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' }}>
          {isLoadingInstant ? 'Starting...' : 'New Meeting'}
        </span>

        {/* Dropdown Options */}
        {dropdownOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 65 }}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '134px',
                left: '0',
                width: '260px',
                backgroundColor: '#1E2330',
                borderRadius: '12px',
                padding: '10px',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 70,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FFF', cursor: 'pointer', padding: '6px' }}>
              <input
                type="checkbox"
                checked={startWithVideo}
                onChange={(e) => setStartWithVideo(e.target.checked)}
                style={{ accentColor: '#0E71EB', width: '16px', height: '16px' }}
              />
              <span>Start with video</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#FFF', cursor: 'pointer', padding: '6px' }}>
              <input
                type="checkbox"
                checked={usePMI}
                onChange={(e) => setUsePMI(e.target.checked)}
                style={{ accentColor: '#0E71EB', width: '16px', height: '16px' }}
              />
              <span>Use My Personal Meeting ID (PMI)</span>
            </label>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{pmi}</span>
              <button
                onClick={handleCopyPMI}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: copiedPMI ? '#10B981' : '#0E71EB',
                  backgroundColor: 'rgba(14, 113, 235, 0.12)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {copiedPMI ? 'Copied' : 'Copy ID'}
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      {/* 2. JOIN (Iconic Zoom Blue Tile) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onOpenJoin}
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '28px',
            backgroundColor: '#0E71EB',
            boxShadow: '0 8px 24px rgba(14, 113, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(14, 113, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 113, 235, 0.35)';
          }}
        >
          <Plus size={48} color="#FFFFFF" strokeWidth={2.4} />
        </button>
        <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' }}>
          Join
        </span>
      </div>

      {/* 3. SCHEDULE (Iconic Zoom Blue Tile) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onOpenSchedule}
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '28px',
            backgroundColor: '#0E71EB',
            boxShadow: '0 8px 24px rgba(14, 113, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(14, 113, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 113, 235, 0.35)';
          }}
        >
          <Calendar size={44} color="#FFFFFF" strokeWidth={2.2} />
        </button>
        <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' }}>
          Schedule
        </span>
      </div>

      {/* 4. SHARE SCREEN (Iconic Zoom Blue Tile) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onOpenShareScreen}
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '28px',
            backgroundColor: '#0E71EB',
            boxShadow: '0 8px 24px rgba(14, 113, 235, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            color: '#FFFFFF',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(14, 113, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(14, 113, 235, 0.35)';
          }}
        >
          <Share2 size={44} color="#FFFFFF" strokeWidth={2.2} />
        </button>
        <span style={{ marginTop: '10px', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' }}>
          Share screen
        </span>
      </div>
    </div>
  );
}
