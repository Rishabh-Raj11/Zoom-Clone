'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Video,
  Search,
  Settings,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Sparkles,
  MessageSquare,
  Calendar,
  PenTool,
  Film,
  Bot,
  Home,
  Grid,
  Plus,
} from 'lucide-react';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  user: User;
  onOpenSettings: () => void;
  activeNavTab?: string;
  onSelectNavTab?: (tab: string) => void;
}

export function Navbar({ user, onOpenSettings, activeNavTab = 'home', onSelectNavTab }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const currentTab = activeNavTab || 'home';

  const displayUser = authUser || user;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'join', label: 'Join', icon: Plus, isAction: true },
    { key: 'chat', label: 'Team Chat', icon: MessageSquare },
    { key: 'meetings', label: 'Meetings', icon: Calendar },
    { key: 'whiteboards', label: 'Whiteboard', icon: PenTool },
    { key: 'clips', label: 'Clips', icon: Film },
    { key: 'ai', label: 'AI Companion', icon: Bot, isSparkle: true },
  ];

  const handleTabClick = (key: string) => {
    if (onSelectNavTab) onSelectNavTab(key);
  };

  return (
    <header
      style={{
        height: '56px',
        backgroundColor: '#161922',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none',
        gap: '12px',
      }}
    >
      {/* Left: Official Zoom Logo Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px', overflowX: 'auto', flexShrink: 1 }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#0E71EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(14, 113, 235, 0.4)',
            }}
          >
            <Video size={18} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          {!isMobile && (
            <span
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#FFFFFF',
                letterSpacing: '-0.4px',
              }}
            >
              zoom <span style={{ color: 'var(--zoom-blue)', fontWeight: '600' }}>Workplace</span>
            </span>
          )}
        </Link>

        {/* Global Navigation Tabs (Horizontal scroll on mobile) */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            paddingBottom: '2px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: isMobile ? '6px 8px' : '7px 12px',
                  borderRadius: '6px',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={item.isSparkle ? '#38BDF8' : isActive ? '#0E71EB' : '#94A3B8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Search Bar (Desktop only) */}
      {!isMobile && (
        <div style={{ position: 'relative', width: '240px', flexShrink: 0 }}>
          <Search
            size={14}
            color="#64748B"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search meetings..."
            style={{
              width: '100%',
              height: '32px',
              paddingLeft: '34px',
              paddingRight: '12px',
              fontSize: '12px',
              borderRadius: '6px',
              backgroundColor: '#0D1117',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Right: Settings & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
          }}
        >
          <Settings size={18} />
        </button>

        {/* User Profile Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--zoom-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                color: '#FFF',
              }}
            >
              {displayUser.name.charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={12} color="#94A3B8" />
          </button>

          {profileOpen && (
            <div
              className="glass-panel-heavy animate-fade-in"
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '240px',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-medium)',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{displayUser.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{displayUser.email}</span>
                {displayUser.pmi && (
                  <span style={{ fontSize: '11px', color: 'var(--zoom-blue)', fontWeight: '600', marginTop: '2px' }}>
                    PMI: {displayUser.pmi}
                  </span>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '8px 0' }} />

              <button
                onClick={() => {
                  setProfileOpen(false);
                  onOpenSettings();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Settings size={15} /> Settings
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '4px',
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
