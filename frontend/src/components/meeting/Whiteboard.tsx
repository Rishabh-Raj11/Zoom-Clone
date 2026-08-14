'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Pen, Highlighter, Eraser, Trash2, Download, X, Circle } from 'lucide-react';
import { WhiteboardPoint } from '@/types';

interface WhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastDraw: (point: WhiteboardPoint) => void;
  onBroadcastClear: () => void;
  remoteDrawPoints?: WhiteboardPoint | null;
  remoteClearTrigger?: number;
}

const COLORS = ['#FFFFFF', '#0E71EB', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6', '#1E232B'];

export function Whiteboard({
  isOpen,
  onClose,
  onBroadcastDraw,
  onBroadcastClear,
  remoteDrawPoints,
  remoteClearTrigger,
}: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState('#0E71EB');
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Resize canvas to match display size
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#171A21';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isOpen]);

  // Handle remote drawings from other participants
  useEffect(() => {
    if (!remoteDrawPoints || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.strokeStyle = remoteDrawPoints.color;
    ctx.lineWidth = remoteDrawPoints.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.arc(remoteDrawPoints.x * canvas.width, remoteDrawPoints.y * canvas.height, remoteDrawPoints.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = remoteDrawPoints.color;
    ctx.fill();
    ctx.restore();
  }, [remoteDrawPoints]);

  // Handle remote canvas clear
  useEffect(() => {
    if (!remoteClearTrigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#171A21';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [remoteClearTrigger]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y };
    drawPoint(x, y, true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);

      if (tool === 'eraser') {
        ctx.strokeStyle = '#171A21';
        ctx.lineWidth = lineWidth * 4;
      } else if (tool === 'highlighter') {
        ctx.strokeStyle = `${color}66`; // 40% opacity
        ctx.lineWidth = lineWidth * 3;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      // Broadcast normalized point to WebSocket
      const prevX = lastPointRef.current ? lastPointRef.current.x / canvas.width : null;
      const prevY = lastPointRef.current ? lastPointRef.current.y / canvas.height : null;

      onBroadcastDraw({
        x: x / canvas.width,
        y: y / canvas.height,
        prevX,
        prevY,
        color: tool === 'eraser' ? '#171A21' : color,
        size: tool === 'eraser' ? lineWidth * 4 : lineWidth,
        tool,
      });
    }

    lastPointRef.current = { x, y };
  };

  const drawPoint = (x: number, y: number, isNewStroke = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, (tool === 'eraser' ? lineWidth * 2 : lineWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? '#171A21' : color;
    ctx.fill();
    ctx.restore();

    onBroadcastDraw({
      x: x / canvas.width,
      y: y / canvas.height,
      prevX: null,
      prevY: null,
      color: tool === 'eraser' ? '#171A21' : color,
      size: lineWidth,
      tool,
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#171A21';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onBroadcastClear();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `zoom-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#171A21',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Whiteboard Floating Toolbar */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Pen */}
        <button
          onClick={() => setTool('pen')}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: tool === 'pen' ? 'var(--zoom-blue)' : 'transparent',
            color: tool === 'pen' ? '#FFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
          }}
        >
          <Pen size={14} /> Pen
        </button>

        {/* Highlighter */}
        <button
          onClick={() => setTool('highlighter')}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: tool === 'highlighter' ? 'var(--zoom-blue)' : 'transparent',
            color: tool === 'highlighter' ? '#FFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
          }}
        >
          <Highlighter size={14} /> Highlight
        </button>

        {/* Eraser */}
        <button
          onClick={() => setTool('eraser')}
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: tool === 'eraser' ? 'var(--zoom-blue)' : 'transparent',
            color: tool === 'eraser' ? '#FFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
          }}
        >
          <Eraser size={14} /> Eraser
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: c,
                border: color === c ? '2px solid #FFF' : '1px solid rgba(255,255,255,0.2)',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.1s ease',
              }}
            />
          ))}
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Clear & Save Actions */}
        <button
          onClick={handleClear}
          title="Clear Whiteboard"
          style={{ color: 'var(--zoom-red)', padding: '6px' }}
        >
          <Trash2 size={16} />
        </button>

        <button
          onClick={handleDownload}
          title="Download Snapshot"
          style={{ color: 'var(--text-primary)', padding: '6px' }}
        >
          <Download size={16} />
        </button>

        <button
          onClick={onClose}
          title="Close Whiteboard"
          style={{ color: 'var(--text-secondary)', padding: '6px' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          width: '100%',
          height: '100%',
          cursor: tool === 'eraser' ? 'crosshair' : 'default',
        }}
      />
    </div>
  );
}
