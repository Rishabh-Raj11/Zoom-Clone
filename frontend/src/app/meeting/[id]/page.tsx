'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  LayoutGrid,
  Check,
  Copy,
  Users,
  Film,
  Disc,
  Lock,
  Clock,
  BarChart3,
  Subtitles,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useMediaStream } from '@/hooks/useMediaStream';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoGrid } from '@/components/meeting/VideoGrid';
import { ControlBar } from '@/components/meeting/ControlBar';
import { ChatSidebar } from '@/components/meeting/ChatSidebar';
import { ParticipantsSidebar } from '@/components/meeting/ParticipantsSidebar';
import { Whiteboard } from '@/components/meeting/Whiteboard';
import { SecurityMenu } from '@/components/meeting/SecurityMenu';
import { ReactionsOverlay } from '@/components/meeting/ReactionsOverlay';
import { LeaveModal } from '@/components/meeting/LeaveModal';
import { PollsModal } from '@/components/meeting/PollsModal';
import { NetworkHealthModal } from '@/components/meeting/NetworkHealthModal';
import { LiveCaptionsBar } from '@/components/meeting/LiveCaptionsBar';
import { Participant, ChatMessage, LayoutMode, WhiteboardPoint, Poll } from '@/types';
import { formatMeetingId, copyToClipboard } from '@/lib/utils';
import { fetchMeetingById } from '@/lib/api';
import { MOCK_PARTICIPANTS } from '@/lib/constants';

export default function MeetingRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const meetingId = params.id;

  // Local User State
  const [userId] = useState(() => `usr_${Math.random().toString(36).substring(2, 9)}`);
  const [displayName, setDisplayName] = useState('Rishabh');
  const [role, setRole] = useState<'host' | 'co-host' | 'participant'>('participant');
  const [meetingDetails, setMeetingDetails] = useState<any>(null);

  // UI State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('gallery');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false);
  const [isPollsOpen, setIsPollsOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isCaptionsActive, setIsCaptionsActive] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Live Captions & Transcripts State
  const [activeCaption, setActiveCaption] = useState<{ speakerName: string; text: string } | null>(null);

  // Live Meeting Elapsed Timer
  const [meetingElapsedSeconds, setMeetingElapsedSeconds] = useState(0);

  // Real-time Collaboration State
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, Participant>>(new Map());
  const [mockActive, setMockActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; senderName: string; xPercent: number }[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);

  // Whiteboard Remote State
  const [remoteDrawPoints, setRemoteDrawPoints] = useState<WhiteboardPoint | null>(null);
  const [remoteClearTrigger, setRemoteClearTrigger] = useState(0);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Media Streams
  const {
    localStream,
    screenStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    audioLevel,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  } = useMediaStream(true, true);

  // Meeting Elapsed Timer Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated AI Speech Captions when CC is active
  useEffect(() => {
    if (!isCaptionsActive) {
      setActiveCaption(null);
      return;
    }

    const sampleCaptions = [
      { speakerName: 'Rishabh', text: 'Welcome everyone! Let us review our architecture roadmap for Sprint 42.' },
      { speakerName: 'Priya Sharma', text: 'The WebRTC peer connection pool benchmark shows sub-14ms latency.' },
      { speakerName: 'Aarav Patel', text: 'Agreed. The SQLite WAL database mode handles high concurrent throughput.' },
      { speakerName: 'Ananya Iyer', text: 'I have updated the Figma components for the Zoom dark theme.' },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      setActiveCaption(sampleCaptions[idx % sampleCaptions.length]);
      idx++;
    }, 4500);

    return () => clearInterval(interval);
  }, [isCaptionsActive]);

  // Load session storage preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = sessionStorage.getItem('zoom_displayName');
      if (savedName) setDisplayName(savedName);
      const autoShare = sessionStorage.getItem('zoom_shareScreenAuto') === 'true';
      if (autoShare) {
        toggleScreenShare();
        sessionStorage.removeItem('zoom_shareScreenAuto');
      }
    }
  }, []);

  // Fetch Meeting info from API
  useEffect(() => {
    fetchMeetingById(meetingId).then((m) => {
      if (m) setMeetingDetails(m);
    });
  }, [meetingId]);

  // WebSocket Message Router
  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      const { type, senderId, senderName, payload } = msg;

      switch (type) {
        case 'existing-participants': {
          if (payload?.yourRole) setRole(payload.yourRole);
          if (payload?.activePolls) setPolls(payload.activePolls);
          if (payload?.participants) {
            const map = new Map<string, Participant>();
            payload.participants.forEach((p: any) => {
              map.set(p.userId, {
                id: p.userId,
                displayName: p.userName,
                role: p.role,
                isMuted: p.isMuted,
                isVideoOff: p.isVideoOff,
                isHandRaised: p.isHandRaised,
                avatarUrl: p.avatarUrl,
              });
              initiateOffer(p.userId);
            });
            setRemoteParticipants(map);
          }
          break;
        }

        case 'user-joined': {
          setRemoteParticipants((prev) => {
            const next = new Map(prev);
            next.set(senderId, {
              id: senderId,
              displayName: senderName || 'Guest',
              role: payload?.role || 'participant',
              isMuted: payload?.isMuted ?? false,
              isVideoOff: payload?.isVideoOff ?? false,
              isHandRaised: false,
              avatarUrl: payload?.avatarUrl,
            });
            return next;
          });
          break;
        }

        case 'user-left': {
          setRemoteParticipants((prev) => {
            const next = new Map(prev);
            next.delete(senderId);
            return next;
          });
          removePeer(senderId);
          break;
        }

        case 'offer': {
          if (payload?.sdp) handleOffer(senderId, payload.sdp);
          break;
        }

        case 'answer': {
          if (payload?.sdp) handleAnswer(senderId, payload.sdp);
          break;
        }

        case 'ice-candidate': {
          if (payload?.candidate) handleIceCandidate(senderId, payload.candidate);
          break;
        }

        case 'chat-message': {
          if (payload) {
            setChatMessages((prev) => [...prev, payload]);
            if (!isChatOpen) {
              setUnreadChatCount((c) => c + 1);
            }
          }
          break;
        }

        case 'poll-update': {
          if (payload?.polls) {
            setPolls(payload.polls);
          }
          break;
        }

        case 'user-state-change': {
          setRemoteParticipants((prev) => {
            const next = new Map(prev);
            const p = next.get(senderId);
            if (p) {
              if (payload.isMuted !== undefined) p.isMuted = payload.isMuted;
              if (payload.isVideoOff !== undefined) p.isVideoOff = payload.isVideoOff;
              if (payload.isHandRaised !== undefined) p.isHandRaised = payload.isHandRaised;
              next.set(senderId, { ...p });
            }
            return next;
          });
          break;
        }

        case 'reaction': {
          if (payload?.emoji) {
            const newReaction = {
              id: `${Date.now()}-${Math.random()}`,
              emoji: payload.emoji,
              senderName: senderName || 'Participant',
              xPercent: Math.floor(20 + Math.random() * 60),
            };
            setReactions((prev) => [...prev, newReaction]);
            setTimeout(() => {
              setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 3000);
          }
          break;
        }

        case 'host-mute-all':
        case 'host-mute-user': {
          if (isAudioEnabled) {
            toggleAudio();
            alert('The host has muted your microphone.');
          }
          break;
        }

        case 'host-kick-user': {
          alert('You have been removed from the meeting by the host.');
          router.push('/');
          break;
        }

        case 'whiteboard-draw': {
          if (payload) setRemoteDrawPoints(payload);
          break;
        }

        case 'whiteboard-clear': {
          setRemoteClearTrigger((t) => t + 1);
          break;
        }
      }
    },
    [isChatOpen, isAudioEnabled, toggleAudio, router]
  );

  // Initialize WebSocket Signaling
  const { sendMessage } = useWebSocket({
    roomId: meetingId,
    userId,
    userName: displayName,
    role,
    onMessage: handleWebSocketMessage,
  });

  // Initialize WebRTC Peer Mesh with Screen Share Support
  const { remoteStreams, initiateOffer, handleOffer, handleAnswer, handleIceCandidate, removePeer } = useWebRTC({
    localStream,
    screenStream,
    isScreenSharing,
    userId,
    sendMessage,
  });

  // Sync Local Participant state changes
  useEffect(() => {
    sendMessage('user-state-change', {
      isMuted: !isAudioEnabled,
      isVideoOff: !isVideoEnabled,
      isHandRaised,
    });
  }, [isAudioEnabled, isVideoEnabled, isHandRaised, sendMessage]);

  // Handle Cloud Recording Timer & Auto Save
  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

      try {
        await fetch('http://localhost:5000/api/recordings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            meetingTitle: meetingDetails?.title || `Zoom Meeting ${formatMeetingId(meetingId)}`,
            durationSeconds: recordingSeconds,
            fileSizeMb: parseFloat((recordingSeconds * 0.45).toFixed(1)),
          }),
        });
      } catch (err) {
        console.error('Failed to save recording:', err);
      }
      setRecordingSeconds(0);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const handleToggleMockParticipants = () => {
    setMockActive(!mockActive);
  };

  const handleSendReaction = (emoji: string) => {
    sendMessage('reaction', { emoji });
    const selfReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      senderName: displayName,
      xPercent: 50,
    };
    setReactions((prev) => [...prev, selfReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== selfReaction.id));
    }, 3000);
  };

  const handleSendChatMessage = (text: string, targetId?: string) => {
    sendMessage('chat-message', { text }, targetId);
  };

  const handleCreatePoll = (q: string, opts: string[]) => {
    sendMessage('create-poll', { question: q, options: opts });
  };

  const handleVotePoll = (pollId: string, optionId: string) => {
    sendMessage('vote-poll', { pollId, optionId });
  };

  const handleMuteAll = () => {
    sendMessage('host-mute-all', {});
  };

  const handleMuteUser = (targetId: string) => {
    sendMessage('host-mute-user', {}, targetId);
  };

  const handleKickUser = (targetId: string) => {
    sendMessage('host-kick-user', {}, targetId);
    setRemoteParticipants((prev) => {
      const next = new Map(prev);
      next.delete(targetId);
      return next;
    });
  };

  const handleLockMeeting = (locked: boolean) => {
    sendMessage('host-lock-room', { locked });
  };

  const handleCopyMeetingInfo = async () => {
    const inviteUrl = `${window.location.origin}/join/${meetingId.replace(/\s/g, '')}`;
    const text = `Topic: ${meetingDetails?.title || 'Zoom Meeting'}\nJoin Meeting: ${inviteUrl}\n\nMeeting ID: ${formatMeetingId(meetingId)}${meetingDetails?.passcode ? `\nPasscode: ${meetingDetails.passcode}` : ''}`;
    await copyToClipboard(text);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2000);
  };

  const formatElapsedTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const localParticipant: Participant = {
    id: userId,
    displayName,
    role,
    isMuted: !isAudioEnabled,
    isVideoOff: !isVideoEnabled,
    isHandRaised,
    isLocal: true,
    stream: isScreenSharing && screenStream ? screenStream : localStream || undefined,
  };

  let allParticipantsList = [
    localParticipant,
    ...Array.from(remoteParticipants.values()).map((p) => ({
      ...p,
      stream: remoteStreams.get(p.id),
    })),
  ];

  if (mockActive) {
    allParticipantsList = [...allParticipantsList, ...MOCK_PARTICIPANTS];
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#07090E',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* TOP HEADER BAR */}
      <div
        className="glass-panel"
        style={{
          height: '52px',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 40,
        }}
      >
        {/* Left: Meeting Info Shield Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsInfoPopoverOpen(!isInfoPopoverOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--zoom-green-live)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              <Shield size={14} />
              <span>Meeting Info</span>
            </button>

            {/* Info Popover */}
            {isInfoPopoverOpen && (
              <div
                className="glass-panel-heavy animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '44px',
                  left: 0,
                  width: '340px',
                  borderRadius: 'var(--radius-xl)',
                  padding: '18px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 60,
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#FFF', marginBottom: '12px' }}>
                  {meetingDetails?.title || 'Zoom Instant Meeting'}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Meeting ID:</span>
                    <strong style={{ color: '#FFF', fontWeight: '700' }}>{formatMeetingId(meetingId)}</strong>
                  </div>
                  {meetingDetails?.passcode && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Passcode:</span>
                      <strong style={{ color: '#FFF', fontWeight: '700' }}>{meetingDetails.passcode}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Host:</span>
                    <span style={{ color: '#FFF', fontWeight: '600' }}>{meetingDetails?.host_name || displayName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Encryption:</span>
                    <span style={{ color: 'var(--zoom-green-live)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> 256-bit AES
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyMeetingInfo}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: copiedInfo ? 'rgba(16, 185, 129, 0.2)' : 'var(--zoom-blue-gradient)',
                    color: '#FFF',
                    padding: '9px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  {copiedInfo ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copiedInfo ? 'Invitation Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Live Meeting Elapsed Time Clock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Clock size={13} color="var(--zoom-blue)" />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatElapsedTime(meetingElapsedSeconds)}</span>
          </div>
        </div>

        {/* Center: Recording Indicator */}
        {isRecording && (
          <div className="badge-rec">
            <span>REC: {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Right: View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setLayoutMode(layoutMode === 'gallery' ? 'speaker' : 'gallery')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid var(--border-medium)',
            }}
          >
            <LayoutGrid size={14} color="var(--zoom-blue)" />
            <span>{layoutMode === 'gallery' ? 'Speaker View' : 'Gallery View'}</span>
          </button>
        </div>
      </div>

      {/* MAIN MEETING CANVAS AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main Stage: Video Grid OR Whiteboard */}
        <div style={{ flex: 1, height: '100%', position: 'relative', overflow: 'hidden' }}>
          {isWhiteboardOpen ? (
            <Whiteboard
              isOpen={isWhiteboardOpen}
              onClose={() => setIsWhiteboardOpen(false)}
              onBroadcastDraw={(point) => sendMessage('whiteboard-draw', point)}
              onBroadcastClear={() => sendMessage('whiteboard-clear', {})}
              remoteDrawPoints={remoteDrawPoints}
              remoteClearTrigger={remoteClearTrigger}
            />
          ) : (
            <VideoGrid
              participants={allParticipantsList}
              layoutMode={layoutMode}
              isSharingActive={isScreenSharing}
              onMuteUser={handleMuteUser}
              onKickUser={handleKickUser}
              isCurrentUserHost={role === 'host'}
            />
          )}

          {/* Floating Live Speech Closed Captions (CC) Subtitle Bar */}
          <LiveCaptionsBar
            isVisible={isCaptionsActive}
            speakerName={activeCaption?.speakerName}
            text={activeCaption?.text}
          />

          {/* Floating Emoji Reactions Overlay */}
          <ReactionsOverlay reactions={reactions} />
        </div>

        {/* In-Meeting Chat Drawer */}
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          participants={allParticipantsList}
          currentUserId={userId}
          onSendMessage={handleSendChatMessage}
        />

        {/* Participants Roster Drawer */}
        <ParticipantsSidebar
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={allParticipantsList}
          currentUserId={userId}
          isCurrentUserHost={role === 'host'}
          meetingId={meetingId}
          passcode={meetingDetails?.passcode}
          onMuteAll={handleMuteAll}
          onMuteUser={handleMuteUser}
          onKickUser={handleKickUser}
        />

        {/* Security Menu Popover */}
        <SecurityMenu
          isOpen={isSecurityOpen}
          onClose={() => setIsSecurityOpen(false)}
          isHost={role === 'host'}
          onLockMeeting={handleLockMeeting}
        />
      </div>

      {/* ZOOM BOTTOM CONTROL TOOLBAR */}
      <ControlBar
        isMuted={!isAudioEnabled}
        isVideoOff={!isVideoEnabled}
        isScreenSharing={isScreenSharing}
        isWhiteboardOpen={isWhiteboardOpen}
        isRecording={isRecording}
        isHandRaised={isHandRaised}
        isCaptionsActive={isCaptionsActive}
        recordingSeconds={recordingSeconds}
        participantsCount={allParticipantsList.length}
        unreadChatCount={unreadChatCount}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        isSecurityOpen={isSecurityOpen}
        isHost={role === 'host'}
        isMockActive={mockActive}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleWhiteboard={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
        onToggleRecord={handleToggleRecord}
        onToggleHandRaise={() => setIsHandRaised(!isHandRaised)}
        onToggleCaptions={() => setIsCaptionsActive(!isCaptionsActive)}
        onOpenPolls={() => setIsPollsOpen(true)}
        onOpenHealth={() => setIsHealthOpen(true)}
        onSendReaction={handleSendReaction}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) setUnreadChatCount(0);
        }}
        onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
        onToggleSecurity={() => setIsSecurityOpen(!isSecurityOpen)}
        onToggleMockParticipants={handleToggleMockParticipants}
        onLeaveMeeting={() => setIsLeaveModalOpen(true)}
      />

      {/* Advanced Modals */}
      <PollsModal
        isOpen={isPollsOpen}
        onClose={() => setIsPollsOpen(false)}
        polls={polls}
        currentUserId={userId}
        isHost={role === 'host'}
        onCreatePoll={handleCreatePoll}
        onVotePoll={handleVotePoll}
      />

      <NetworkHealthModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        meetingId={meetingId}
      />

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        isHost={role === 'host'}
        onLeaveOnly={() => router.push('/')}
        onEndMeetingForAll={async () => {
          try {
            await fetch(`http://localhost:5000/api/meetings/${meetingId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'ended' }),
            });
          } catch (e) {}
          router.push('/');
        }}
      />
    </div>
  );
}
