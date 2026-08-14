'use client';

import React, { useState } from 'react';
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
  const currentTab = activeNavTab || 'home';

  const displayUser = authUser || user;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'chat', label: 'Team Chat', icon: MessageSquare },
    { key: 'meetings', label: 'Meetings', icon: Calendar },
    { key: 'whiteboards', label: 'Whiteboards', icon: PenTool },
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
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {/* Left: Official Zoom Logo Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
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
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
            zoom
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: '800',
              backgroundColor: 'rgba(14, 113, 235, 0.18)',
              color: '#2D8CFF',
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.5px',
            }}
          >
            WORKPLACE
          </span>
        </Link>

        {/* Center-Left: Official Top Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '12px' }}>
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
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={15} color={item.isSparkle ? '#38BDF8' : isActive ? '#0E71EB' : '#94A3B8'} />
                <span>{item.label}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-12px',
                      left: '12px',
                      right: '12px',
                      height: '2px',
                      backgroundColor: '#0E71EB',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Center Search Bar */}
      <div style={{ position: 'relative', width: '280px' }}>
        <Search
          size={14}
          color="#64748B"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search..."
          style={{
            width: '100%',
            height: '32px',
            paddingLeft: '34px',
            paddingRight: '36px',
            fontSize: '12px',
            borderRadius: '6px',
            backgroundColor: '#0D1117',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '10px',
            fontWeight: '600',
            color: '#64748B',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
          }}
        >
          Ctrl+F
        </span>
      </div>

      {/* Right: Settings & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            color: '#94A3B8',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#FFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <Settings size={17} />
        </button>

        {/* User Avatar Circle with Online Presence Indicator */}
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
              padding: '2px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={displayUser.avatar_url}
                alt={displayUser.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #0E71EB',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid #161922',
                }}
              />
            </div>
            <ChevronDown size={13} color="#94A3B8" />
          </button>

          {/* Profile Popover */}
          {profileOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 55 }}
                onClick={() => setProfileOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '42px',
                  width: '260px',
                  backgroundColor: '#1A1E29',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px 10px 4px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <img
                  src={displayUser.avatar_url}
                  alt={displayUser.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>{displayUser.name}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{displayUser.email}</div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#0E71EB',
                      backgroundColor: 'rgba(14, 113, 235, 0.15)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '700',
                      display: 'inline-block',
                      marginTop: '4px',
                    }}
                  >
                    LICENSED
                  </span>
                </div>
              </div>

              <div style={{ padding: '6px 4px', fontSize: '12px', color: '#94A3B8' }}>
                <div>Personal Meeting ID (PMI):</div>
                <strong style={{ color: '#FFF', fontSize: '13px', letterSpacing: '0.5px' }}>
                  {displayUser.pmi || '942 581 4920'}
                </strong>
              </div>

              <button
                onClick={onOpenSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  color: '#FFF',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Settings size={15} /> Settings
              </button>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  color: '#EF4444',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
