'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
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

  // Helper to create or get an RTCPeerConnection for a remote peer
  const createPeerConnection = useCallback((peerId: string) => {
    if (peerConnections.current.has(peerId)) {
      return peerConnections.current.get(peerId)!;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to this peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage('ice-candidate', { candidate: event.candidate }, peerId);
      }
    };

    // Remote Track received
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote track from peer: ${peerId}`);
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
          stream.addTrack(event.track);
        }
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(peerId);
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
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  // Initiate an Offer to a newly discovered peer
  const initiateOffer = useCallback(async (peerId: string) => {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendMessage('offer', { sdp: offer }, peerId);
    } catch (err) {
      console.error(`[WebRTC] Error creating offer for ${peerId}:`, err);
    }
  }, [createPeerConnection, sendMessage]);

  // Handle incoming Offer from a peer
  const handleOffer = useCallback(async (peerId: string, offerSdp: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection(peerId);
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendMessage('answer', { sdp: answer }, peerId);
    } catch (err) {
      console.error(`[WebRTC] Error handling offer from ${peerId}:`, err);
    }
  }, [createPeerConnection, sendMessage]);

  // Handle incoming Answer from a peer
  const handleAnswer = useCallback(async (peerId: string, answerSdp: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnections.current.get(peerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
      }
    } catch (err) {
      console.error(`[WebRTC] Error handling answer from ${peerId}:`, err);
    }
  }, []);

  // Handle incoming ICE Candidate
  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnections.current.get(peerId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error(`[WebRTC] Error adding ICE candidate from ${peerId}:`, err);
    }
  }, []);

  // Replace or update track across all active peer connections when local stream changes
  useEffect(() => {
    if (!localStream) return;

    peerConnections.current.forEach((pc) => {
      const senders = pc.getSenders();
      localStream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track);
        } else {
          pc.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
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
