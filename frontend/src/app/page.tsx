'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/dashboard/Navbar';
import { HeroClock } from '@/components/dashboard/HeroClock';
import { ActionCards } from '@/components/dashboard/ActionCards';
import { UpcomingMeetings } from '@/components/dashboard/UpcomingMeetings';
import { RecentMeetings } from '@/components/dashboard/RecentMeetings';
import { RecordingsList } from '@/components/dashboard/RecordingsList';
import { ScheduleModal } from '@/components/dashboard/ScheduleModal';
import { JoinModal } from '@/components/dashboard/JoinModal';
import { SettingsModal } from '@/components/dashboard/SettingsModal';

// Dedicated Views for Top Nav Tabs
import { TeamChatView } from '@/components/chat/TeamChatView';
import { MeetingsCalendarView } from '@/components/meetings/MeetingsCalendarView';
import { WhiteboardStudioView } from '@/components/whiteboard/WhiteboardStudioView';
import { ClipsLibraryView } from '@/components/clips/ClipsLibraryView';
import { AICompanionView } from '@/components/ai/AICompanionView';

import {
  Calendar,
  History,
  Film,
  Plus,
  Zap,
} from 'lucide-react';
import { Meeting, User, Recording } from '@/types';
import {
  fetchMeetings,
  fetchCurrentUser,
  fetchRecordings,
  createInstantMeeting,
  deleteMeeting as apiDeleteMeeting,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_rishabh',
    name: 'Rishabh',
    email: 'rishabh@zoomclone.dev',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    pmi: '942 581 4920',
  });

  // Top Nav Tab State ('home' | 'chat' | 'meetings' | 'whiteboards' | 'clips' | 'ai')
  const [navTab, setNavTab] = useState<string>('home');

  // Sub Tab inside Home ('upcoming' | 'recent' | 'recordings')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent' | 'recordings'>('upcoming');

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isInstantLoading, setIsInstantLoading] = useState(false);

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isShareScreenMode, setIsShareScreenMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  const loadData = async () => {
    try {
      setIsLoadingMeetings(true);
      const [mList, rList] = await Promise.all([
        fetchMeetings(),
        fetchRecordings(),
      ]);
      setAllMeetings(mList);
      setRecordings(rList);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingMeetings(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const upcomingMeetings = allMeetings.filter((m) => m.status === 'upcoming');
  const recentMeetings = allMeetings.filter((m) => m.status === 'ended');
  const nextMeeting = upcomingMeetings.length > 0 ? upcomingMeetings[0] : null;

  const handleNewMeeting = async (startWithVideo: boolean) => {
    try {
      setIsInstantLoading(true);
      const meeting = await createInstantMeeting({
        title: `${currentUser.name.split(' ')[0]}'s Zoom Meeting`,
        hostVideoDefault: startWithVideo,
        participantVideoDefault: true,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('zoom_displayName', currentUser.name);
        sessionStorage.setItem('zoom_initialAudio', 'true');
        sessionStorage.setItem('zoom_initialVideo', startWithVideo.toString());
      }

      const cleanId = meeting.meeting_id.replace(/\s/g, '');
      router.push(`/meeting/${cleanId}`);
    } catch (err) {
      console.error('Failed to launch instant meeting:', err);
      alert('Could not start instant meeting. Please check backend server.');
    } finally {
      setIsInstantLoading(false);
    }
  };

  const handleMeetingScheduled = (newMeeting: Meeting) => {
    setAllMeetings((prev) => [newMeeting, ...prev]);
    setActiveTab('upcoming');
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm('Are you sure you want to cancel and delete this meeting?')) {
      const ok = await apiDeleteMeeting(id);
      if (ok) {
        setAllMeetings((prev) => prev.filter((m) => m.id !== id));
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0C10', position: 'relative' }}>
      {/* Official Zoom Top Navbar */}
      <Navbar
        user={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeNavTab={navTab}
        onSelectNavTab={(tab) => {
          if (tab === 'join') {
            setIsJoinOpen(true);
          } else {
            setNavTab(tab);
          }
        }}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. HOME TAB (Iconic Zoom 2-Column Split + Agenda) */}
        {navTab === 'home' && (
          <>
            {/* OFFICIAL 2-COLUMN ZOOM DESKTOP HERO SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '32px', alignItems: 'center' }}>
              {/* Left Column: 4 Iconic Zoom Action Tiles */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ActionCards
                  onNewMeeting={handleNewMeeting}
                  onOpenJoin={() => {
                    setIsShareScreenMode(false);
                    setIsJoinOpen(true);
                  }}
                  onOpenSchedule={() => setIsScheduleOpen(true)}
                  onOpenShareScreen={() => {
                    setIsShareScreenMode(true);
                    setIsJoinOpen(true);
                  }}
                  isLoadingInstant={isInstantLoading}
                />
              </div>

              {/* Right Column: Dynamic Wallpaper Clock Card with Next Meeting */}
              <div>
                <HeroClock userName={currentUser.name} nextMeeting={nextMeeting} />
              </div>
            </div>

            {/* BOTTOM SECTION: MEETINGS MANAGEMENT TABS */}
            <div style={{ backgroundColor: '#13161F', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px' }}>
              {/* Tab Headers */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '14px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: activeTab === 'upcoming' ? '700' : '500',
                      color: activeTab === 'upcoming' ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: activeTab === 'upcoming' ? '#0E71EB' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Calendar size={15} />
                    <span>Upcoming</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: activeTab === 'upcoming' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: '#FFF',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      {upcomingMeetings.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('recent')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: activeTab === 'recent' ? '700' : '500',
                      color: activeTab === 'recent' ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: activeTab === 'recent' ? '#0E71EB' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <History size={15} />
                    <span>Recorded / Previous</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: activeTab === 'recent' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: '#FFF',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      {recentMeetings.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('recordings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: activeTab === 'recordings' ? '700' : '500',
                      color: activeTab === 'recordings' ? '#FFFFFF' : '#94A3B8',
                      backgroundColor: activeTab === 'recordings' ? '#0E71EB' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Film size={15} />
                    <span>Cloud Recordings</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: activeTab === 'recordings' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        color: '#FFF',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      {recordings.length}
                    </span>
                  </button>
                </div>

                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => setIsScheduleOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#0E71EB',
                      backgroundColor: 'rgba(14, 113, 235, 0.12)',
                      border: '1px solid rgba(14, 113, 235, 0.3)',
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '7px 14px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Schedule Meeting
                  </button>
                )}
              </div>

              {/* Tab Content Panels */}
              {isLoadingMeetings ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
                  <Zap size={24} color="#0E71EB" className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                  <span>Loading meetings...</span>
                </div>
              ) : (
                <>
                  {activeTab === 'upcoming' && (
                    <UpcomingMeetings
                      meetings={upcomingMeetings}
                      onDeleteMeeting={handleDeleteMeeting}
                      onOpenSchedule={() => setIsScheduleOpen(true)}
                    />
                  )}
                  {activeTab === 'recent' && <RecentMeetings meetings={recentMeetings} />}
                  {activeTab === 'recordings' && <RecordingsList recordings={recordings} />}
                </>
              )}
            </div>
          </>
        )}

        {/* 2. TEAM CHAT TAB */}
        {navTab === 'chat' && <TeamChatView currentUser={currentUser} />}

        {/* 3. MEETINGS TAB */}
        {navTab === 'meetings' && (
          <MeetingsCalendarView
            currentUser={currentUser}
            meetings={allMeetings}
            recordings={recordings}
            onOpenSchedule={() => setIsScheduleOpen(true)}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}

        {/* 4. WHITEBOARDS TAB */}
        {navTab === 'whiteboards' && <WhiteboardStudioView currentUser={currentUser} />}

        {/* 5. CLIPS TAB */}
        {navTab === 'clips' && <ClipsLibraryView currentUser={currentUser} />}

        {/* 6. AI COMPANION TAB */}
        {navTab === 'ai' && <AICompanionView currentUser={currentUser} />}
      </main>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onMeetingScheduled={handleMeetingScheduled}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        defaultDisplayName={currentUser.name}
        isShareScreenMode={isShareScreenMode}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />
    </div>
  );
}
