'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketHookProps {
  roomId: string;
  userId: string;
  userName: string;
  role?: 'host' | 'co-host' | 'participant';
  onMessage?: (message: any) => void;
}

export function useWebSocket({ roomId, userId, userName, role = 'participant', onMessage }: WebSocketHookProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  onMessageRef.current = onMessage;

  const sendMessage = useCallback((type: string, payload: any = {}, targetId?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type,
          roomId,
          senderId: userId,
          senderName: userName,
          targetId,
          payload,
        })
      );
    } else {
      console.warn('[WebSocket] Cannot send message, socket not open. State:', wsRef.current?.readyState);
    }
  }, [roomId, userId, userName]);

  useEffect(() => {
    if (!roomId || !userId) return;

    // Support NEXT_PUBLIC_WS_URL directly, or compute with ws:// in dev and wss:// in prod
    const defaultHost = typeof window !== 'undefined' ? `${window.location.hostname}:5000` : 'localhost:5000';
    const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || (isProduction ? 'wss://zoom-clone-l5ro.onrender.com/ws' : `${wsProtocol}//${process.env.NEXT_PUBLIC_WS_HOST || defaultHost}/ws`);

    console.log(`[WebSocket] Connecting to: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully.');
      setIsConnected(true);
      setConnectionError(null);

      // Immediately send join-room packet
      ws.send(
        JSON.stringify({
          type: 'join-room',
          roomId,
          senderId: userId,
          senderName: userName,
          payload: { role },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (onMessageRef.current) {
          onMessageRef.current(msg);
        }
      } catch (err) {
        console.error('[WebSocket] Failed to parse incoming message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error encountered:', err);
      setConnectionError('WebSocket connection error');
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed:', event.code, event.reason);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [roomId, userId, userName, role]);

  return {
    isConnected,
    connectionError,
    sendMessage,
  };
}
