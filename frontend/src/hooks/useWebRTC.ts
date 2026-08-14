'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ICE_CONFIG } from '@/lib/constants';

interface UseWebRTCProps {
  localStream: MediaStream | null;
  screenStream?: MediaStream | null;
  isScreenSharing?: boolean;
  userId: string;
  sendMessage: (type: string, payload?: any, recipientId?: string) => void;
}

export function useWebRTC({
  localStream,
  screenStream,
  isScreenSharing = false,
  userId,
  sendMessage,
}: UseWebRTCProps) {
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const iceCandidateQueues = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Determine active outgoing video stream (Screen share takes top priority when active)
  const activeVideoStream = useMemo(() => {
    return isScreenSharing && screenStream ? screenStream : localStream;
  }, [isScreenSharing, screenStream, localStream]);

  // Create an RTCPeerConnection for a specific remote peer with full audio/video transceivers
  const createPeerConnection = useCallback((peerId: string) => {
    const existing = peerConnections.current.get(peerId);
    if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
      return existing;
    }

    console.log(`[WebRTC] Initializing robust RTCPeerConnection for peer: ${peerId}`);
    const pc = new RTCPeerConnection(ICE_CONFIG);

    // 1. Always pre-register audio and video transceivers to guarantee bi-directional tracks
    try {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      pc.addTransceiver('video', { direction: 'sendrecv' });
    } catch (e) {
      console.warn('[WebRTC] addTransceiver note:', e);
    }

    // 2. Attach local audio tracks
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        try {
          const senders = pc.getSenders();
          const aSender = senders.find((s) => s.track?.kind === 'audio');
          if (aSender) {
            aSender.replaceTrack(track).catch(() => {});
          } else {
            pc.addTrack(track, localStream);
          }
        } catch (e) {
          console.warn(`[WebRTC] Audio track add error:`, e);
        }
      });
    }

    // 3. Attach active video track (Webcam or Screen Share)
    if (activeVideoStream) {
      activeVideoStream.getVideoTracks().forEach((track) => {
        try {
          track.enabled = true;
          const senders = pc.getSenders();
          const vSender = senders.find((s) => s.track?.kind === 'video');
          if (vSender) {
            vSender.replaceTrack(track).catch(() => {});
          } else {
            pc.addTrack(track, activeVideoStream);
          }
        } catch (e) {
          console.warn(`[WebRTC] Video track add error:`, e);
        }
      });
    }

    // 4. Send ICE Candidates with priority
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage('ice-candidate', { candidate: event.candidate.toJSON() }, peerId);
      }
    };

    // 5. Remote Track event handler
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote ${event.track.kind} track from peer: ${peerId}`);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        if (event.streams && event.streams[0]) {
          next.set(peerId, event.streams[0]);
        } else {
          let stream = next.get(peerId);
          if (!stream) {
            stream = new MediaStream();
            next.set(peerId, stream);
          }
          if (!stream.getTracks().some((t) => t.id === event.track.id)) {
            stream.addTrack(event.track);
          }
        }
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'failed') {
        console.warn(`[WebRTC] Connection failed with ${peerId}, restarting ICE...`);
        pc.restartIce();
      } else if (pc.connectionState === 'closed') {
        removePeer(peerId);
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream, activeVideoStream, sendMessage]);

  // Remove peer connection
  const removePeer = useCallback((peerId: string) => {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
    }
    iceCandidateQueues.current.delete(peerId);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  // Flush buffered ICE candidates
  const flushIceCandidates = async (peerId: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueues.current.get(peerId) || [];
    if (queue.length > 0) {
      for (const cand of queue) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn(`[WebRTC] Failed to add queued ICE candidate:`, err);
        }
      }
      iceCandidateQueues.current.set(peerId, []);
    }
  };

  // Initiate an Offer to a peer
  const initiateOffer = useCallback(async (peerId: string) => {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      sendMessage('offer', { sdp: offer }, peerId);
    } catch (err) {
      console.error(`[WebRTC] Error creating offer for ${peerId}:`, err);
    }
  }, [createPeerConnection, sendMessage]);

  // Handle incoming Offer from a peer
  const handleOffer = useCallback(
    async (peerId: string, offerSdp: RTCSessionDescriptionInit) => {
      try {
        const pc = createPeerConnection(peerId);
        await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
        await flushIceCandidates(peerId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendMessage('answer', { sdp: answer }, peerId);
      } catch (err) {
        console.error(`[WebRTC] Error handling offer from ${peerId}:`, err);
      }
    },
    [createPeerConnection, sendMessage]
  );

  // Handle incoming Answer from a peer
  const handleAnswer = useCallback(async (peerId: string, answerSdp: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnections.current.get(peerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        await flushIceCandidates(peerId, pc);
      }
    } catch (err) {
      console.error(`[WebRTC] Error handling answer from ${peerId}:`, err);
    }
  }, []);

  // Handle incoming ICE Candidate with queueing
  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnections.current.get(peerId);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        const queue = iceCandidateQueues.current.get(peerId) || [];
        queue.push(candidate);
        iceCandidateQueues.current.set(peerId, queue);
      }
    } catch (err) {
      console.error(`[WebRTC] Error adding ICE candidate:`, err);
    }
  }, []);

  // Dynamically replace Video Track on all peer connections when screen sharing starts, stops, or webcam changes
  useEffect(() => {
    const videoTrack = activeVideoStream?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = true;

    peerConnections.current.forEach((pc, peerId) => {
      const senders = pc.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === 'video' || s.track === null);
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).then(() => {
          console.log(`[WebRTC] Successfully switched video track for peer ${peerId}`);
        }).catch((e) => {
          console.warn('[WebRTC] replaceTrack warning, renegotiating offer:', e);
          initiateOffer(peerId);
        });
      } else if (activeVideoStream) {
        try {
          pc.addTrack(videoTrack, activeVideoStream);
          initiateOffer(peerId);
        } catch (e) {
          console.warn('[WebRTC] addTrack error:', e);
        }
      }
    });
  }, [activeVideoStream, isScreenSharing, screenStream, localStream, initiateOffer]);

  // Update Audio Track if mic state changes
  useEffect(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    peerConnections.current.forEach((pc) => {
      const senders = pc.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === 'audio');
      if (audioSender) {
        audioSender.replaceTrack(audioTrack).catch((e) => console.warn('[WebRTC] audio replaceTrack error:', e));
      }
    });
  }, [localStream]);

  return {
    remoteStreams,
    createPeerConnection,
    initiateOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  };
}
