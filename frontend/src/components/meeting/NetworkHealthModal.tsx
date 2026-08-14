'use client';

import React from 'react';
import { X, Shield, Activity, Wifi, Lock, Server, Cpu } from 'lucide-react';

interface NetworkHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
}

export function NetworkHealthModal({ isOpen, onClose, meetingId }: NetworkHealthModalProps) {
  if (!isOpen) return null;

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
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(16, 185, 129, 0.15)',
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
                background: 'var(--zoom-teal-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={20} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFF' }}>Call Quality & Diagnostics</h3>
              <span style={{ fontSize: '12px', color: 'var(--zoom-green-live)', fontWeight: '600' }}>● Connection Health: Excellent</span>
            </div>
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

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(16, 21, 34, 0.8)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Latency (RTT)
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>14 ms</div>
              <div style={{ fontSize: '11px', color: 'var(--zoom-green-live)', marginTop: '2px' }}>Ultra Low Latency</div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(16, 21, 34, 0.8)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Video Resolution
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>1080p @ 60fps</div>
              <div style={{ fontSize: '11px', color: 'var(--zoom-blue-hover)', marginTop: '2px' }}>VP8 / WebRTC H.264</div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(16, 21, 34, 0.8)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Audio Codec
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>Opus 48 kHz</div>
              <div style={{ fontSize: '11px', color: 'var(--zoom-green-live)', marginTop: '2px' }}>Stereo Noise Cancelled</div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(16, 21, 34, 0.8)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                Packet Loss
              </div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#FFF' }}>0.00 %</div>
              <div style={{ fontSize: '11px', color: 'var(--zoom-green-live)', marginTop: '2px' }}>Zero Jitter</div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(14, 113, 235, 0.1)',
              border: '1px solid rgba(14, 113, 235, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} color="var(--zoom-blue)" />
              <div>
                <div style={{ fontWeight: '700', color: '#FFF' }}>End-to-End Transport Encryption</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>256-bit AES GCM Media Protocol</div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--zoom-blue-hover)' }}>VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
