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

  // Setup Audio Meter
  const setupAudioMeter = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

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
      console.warn('Audio meter setup warning:', e);
    }
  };

  // Initialize Camera & Mic with layered fallbacks for Laptops & Mobile
  const initMedia = useCallback(async () => {
    setIsInitializing(true);
    setPermissionError(null);

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      console.warn('getUserMedia not supported in this environment');
      setIsInitializing(false);
      return null;
    }

    let stream: MediaStream | null = null;

    // Strategy 1: Attempt both Audio and Video together
    try {
      stream = await navigator.mediaDevices.getUserMedia({
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
    } catch (err1: any) {
      console.warn('[MediaStream] Full media acquisition failed, trying audio only fallback...', err1);

      // Strategy 2: Attempt Audio only (e.g. laptop camera blocked or in use)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err2: any) {
        console.warn('[MediaStream] Audio only acquisition failed, trying video only...', err2);

        // Strategy 3: Attempt Video only
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            },
          });
        } catch (err3: any) {
          console.warn('[MediaStream] Video only acquisition failed:', err3);
          setPermissionError('Could not access camera or microphone');
          stream = new MediaStream();
        }
      }
    }

    if (!stream) {
      stream = new MediaStream();
    }

    // Configure tracks based on initial flags
    stream.getVideoTracks().forEach((t) => (t.enabled = initialVideo));
    stream.getAudioTracks().forEach((t) => (t.enabled = initialAudio));

    setLocalStream(stream);
    setIsVideoEnabled(initialVideo && stream.getVideoTracks().length > 0);
    setIsAudioEnabled(initialAudio && stream.getAudioTracks().length > 0);

    if (stream.getAudioTracks().length > 0) {
      setupAudioMeter(stream);
    }

    setIsInitializing(false);
    return stream;
  }, [initialVideo, initialAudio]);

  // Toggle Video (with on-demand camera acquisition if tracks don't exist)
  const toggleVideo = useCallback(async () => {
    if (!localStream) {
      setIsVideoEnabled((prev) => !prev);
      return;
    }

    const videoTracks = localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const newState = !videoTracks[0].enabled;
      videoTracks.forEach((track) => (track.enabled = newState));
      setIsVideoEnabled(newState);
    } else {
      // Laptop camera track was not acquired yet -> Request camera actively
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        const newTrack = vStream.getVideoTracks()[0];
        if (newTrack) {
          newTrack.enabled = true;
          localStream.addTrack(newTrack);
          setLocalStream(new MediaStream(localStream.getTracks()));
          setIsVideoEnabled(true);
        }
      } catch (err) {
        console.warn('Could not acquire camera on toggle:', err);
        setIsVideoEnabled((prev) => !prev);
      }
    }
  }, [localStream]);

  // Toggle Audio (with on-demand microphone acquisition if tracks don't exist)
  const toggleAudio = useCallback(async () => {
    if (!localStream) {
      setIsAudioEnabled((prev) => !prev);
      return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const newState = !audioTracks[0].enabled;
      audioTracks.forEach((track) => (track.enabled = newState));
      setIsAudioEnabled(newState);
    } else {
      // Laptop mic track was not acquired yet -> Request mic actively
      try {
        const aStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        const newTrack = aStream.getAudioTracks()[0];
        if (newTrack) {
          newTrack.enabled = true;
          localStream.addTrack(newTrack);
          setLocalStream(new MediaStream(localStream.getTracks()));
          setIsAudioEnabled(true);
          setupAudioMeter(localStream);
        }
      } catch (err) {
        console.warn('Could not acquire microphone on toggle:', err);
        setIsAudioEnabled((prev) => !prev);
      }
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
          video: {
            cursor: 'always',
            frameRate: { ideal: 60, max: 60 },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const sStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

        // Listen for browser's native "Stop Sharing" bar click
        sStream.getVideoTracks()[0].onended = () => {
          sStream.getTracks().forEach((t) => t.stop());
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
        audioContextRef.current.close().catch(() => {});
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
