'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useMediaStream(initialVideo = true, initialAudio = true) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudio);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Camera & Mic
  const initMedia = useCallback(async () => {
    try {
      setIsInitializing(true);
      setPermissionError(null);

      // Check if mediaDevices is supported
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn('getUserMedia not supported in this environment');
        setIsInitializing(false);
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Apply initial mute/video settings
      stream.getVideoTracks().forEach((t) => (t.enabled = initialVideo));
      stream.getAudioTracks().forEach((t) => (t.enabled = initialAudio));

      setLocalStream(stream);
      setIsVideoEnabled(initialVideo);
      setIsAudioEnabled(initialAudio);

      // Setup audio analyzer for volume meter
      setupAudioMeter(stream);

      setIsInitializing(false);
      return stream;
    } catch (err: any) {
      console.warn('Media access warning/error:', err.name || err.message);
      setPermissionError(err.name || 'Could not access camera/microphone');
      setIsInitializing(false);
      return null;
    }
  }, [initialVideo, initialAudio]);

  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (e) {
      console.error('Audio meter setup error:', e);
    }
  };

  // Toggle Video
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const newState = !videoTracks[0].enabled;
      videoTracks.forEach((track) => (track.enabled = newState));
      setIsVideoEnabled(newState);
    } else if (!isVideoEnabled) {
      // If no track existed, re-request
      initMedia();
    }
  }, [localStream, isVideoEnabled, initMedia]);

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const newState = !audioTracks[0].enabled;
      audioTracks.forEach((track) => (track.enabled = newState));
      setIsAudioEnabled(newState);
    }
  }, [localStream]);

  // Start / Stop Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      return null;
    } else {
      try {
        if (!navigator?.mediaDevices?.getDisplayMedia) {
          alert('Screen sharing is not supported in this browser.');
          return null;
        }
        const displayMediaOptions: any = {
          video: { cursor: 'always' },
          audio: false,
        };
        const sStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

        // Listen for browser's native "Stop Sharing" bar click
        sStream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };

        setScreenStream(sStream);
        setIsScreenSharing(true);
        return sStream;
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          console.error('Screen share error:', err);
        }
        return null;
      }
    }
  }, [isScreenSharing, screenStream]);

  useEffect(() => {
    initMedia();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    localStream,
    screenStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    audioLevel,
    permissionError,
    isInitializing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    setIsVideoEnabled,
    setIsAudioEnabled,
    initMedia,
  };
}
