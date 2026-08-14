'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Comprehensive high-speed global STUN configuration for cross-network NAT traversal
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  iceCandidatePoolSize: 10,
};

interface WebRTCHookProps {
  localStream: MediaStream | null;
  userId: string;
  sendMessage: (type: string, payload: any, targetId?: string) => void;
}

export function useWebRTC({ localStream, userId, sendMessage }: WebRTCHookProps) {
  // Map peerId -> RTCPeerConnection
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Map peerId -> remote MediaStream
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  // Map peerId -> queued ICE candidates received before remoteDescription was set
  const iceCandidateQueues = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // Helper to create or get an RTCPeerConnection for a remote peer
  const createPeerConnection = useCallback((peerId: string) => {
    if (peerConnections.current.has(peerId)) {
      return peerConnections.current.get(peerId)!;
    }

    console.log(`[WebRTC] Creating new RTCPeerConnection for peer: ${peerId}`);
    const pc = new RTCPeerConnection(ICE_CONFIG);

    // Add local stream tracks if available
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          pc.addTrack(track, localStream);
        } catch (e) {
          console.warn(`[WebRTC] Track already added for ${peerId}:`, e);
        }
      });
    }

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage('ice-candidate', { candidate: event.candidate.toJSON() }, peerId);
      }
    };

    // Remote Track received
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
          // Avoid duplicate tracks
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
        console.warn(`[WebRTC] Connection failed with ${peerId}, attempting ICE restart...`);
        pc.restartIce();
      } else if (pc.connectionState === 'closed') {
        removePeer(peerId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        pc.restartIce();
      }
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  }, [localStream, sendMessage]);

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

  // Flush buffered ICE candidates once remote description is set
  const flushIceCandidates = async (peerId: string, pc: RTCPeerConnection) => {
    const queue = iceCandidateQueues.current.get(peerId) || [];
    if (queue.length > 0) {
      console.log(`[WebRTC] Flushing ${queue.length} queued ICE candidates for ${peerId}`);
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

  // Initiate an Offer to a newly discovered peer
  const initiateOffer = useCallback(async (peerId: string) => {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      console.log(`[WebRTC] Sending offer to ${peerId}`);
      sendMessage('offer', { sdp: offer }, peerId);
    } catch (err) {
      console.error(`[WebRTC] Error creating offer for ${peerId}:`, err);
    }
  }, [createPeerConnection, sendMessage]);

  // Handle incoming Offer from a peer
  const handleOffer = useCallback(async (peerId: string, offerSdp: RTCSessionDescriptionInit) => {
    try {
      console.log(`[WebRTC] Handling offer from ${peerId}`);
      const pc = createPeerConnection(peerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      await flushIceCandidates(peerId, pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log(`[WebRTC] Sending answer to ${peerId}`);
      sendMessage('answer', { sdp: answer }, peerId);
    } catch (err) {
      console.error(`[WebRTC] Error handling offer from ${peerId}:`, err);
    }
  }, [createPeerConnection, sendMessage]);

  // Handle incoming Answer from a peer
  const handleAnswer = useCallback(async (peerId: string, answerSdp: RTCSessionDescriptionInit) => {
    try {
      console.log(`[WebRTC] Handling answer from ${peerId}`);
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
        // Buffer candidate until remote description is applied
        const queue = iceCandidateQueues.current.get(peerId) || [];
        queue.push(candidate);
        iceCandidateQueues.current.set(peerId, queue);
      }
    } catch (err) {
      console.error(`[WebRTC] Error adding ICE candidate from ${peerId}:`, err);
    }
  }, []);

  // Dynamically update/replace tracks across all active peer connections when local stream changes
  useEffect(() => {
    if (!localStream) return;

    peerConnections.current.forEach((pc, peerId) => {
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch((e) => console.warn('replaceTrack error:', e));
        } else {
          try {
            pc.addTrack(track, localStream);
          } catch (e) {
            console.warn('addTrack error:', e);
          }
        }
      });
    });
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      iceCandidateQueues.current.clear();
    };
  }, []);

  return {
    remoteStreams,
    initiateOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  };
}
