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

  const drawPoint = (x: number, y: number, isStart: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actualColor = tool === 'eraser' ? '#171A21' : color;
    const actualWidth = tool === 'eraser' ? 24 : tool === 'highlighter' ? 16 : lineWidth;
    const opacity = tool === 'highlighter' ? 0.35 : 1;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = actualColor;
    ctx.fillStyle = actualColor;
    ctx.lineWidth = actualWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isStart || !lastPointRef.current) {
      ctx.beginPath();
      ctx.arc(x, y, actualWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.restore();

    onBroadcastDraw({
      x: x / canvas.width,
      y: y / canvas.height,
      color: actualColor,
      size: actualWidth,
      isDragging: !isStart,
    });
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y };
    drawPoint(x, y, true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawPoint(x, y, false);
    lastPointRef.current = { x, y };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Touch handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    lastPointRef.current = { x, y };
    drawPoint(x, y, true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    drawPoint(x, y, false);
    lastPointRef.current = { x, y };
  };

  const handleTouchEnd = () => {
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
    }
    onBroadcastClear();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `zoom-whiteboard-${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#10141E',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Floating Whiteboard Toolbar */}
      <div
        className="glass-panel"
        style={{
          margin: '12px 16px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 70,
        }}
      >
        {/* Tools (Pen, Highlighter, Eraser) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setTool('pen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: tool === 'pen' ? 'var(--zoom-blue)' : 'rgba(255,255,255,0.06)',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Pen size={14} /> Pen
          </button>
          <button
            onClick={() => setTool('highlighter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: tool === 'highlighter' ? 'var(--zoom-blue)' : 'rgba(255,255,255,0.06)',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Highlighter size={14} /> Highlight
          </button>
          <button
            onClick={() => setTool('eraser')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: tool === 'eraser' ? 'var(--zoom-blue)' : 'rgba(255,255,255,0.06)',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Eraser size={14} /> Eraser
          </button>
        </div>

        {/* Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (tool === 'eraser') setTool('pen');
              }}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: c,
                border: color === c ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                boxShadow: color === c ? '0 0 8px #FFF' : 'none',
              }}
            />
          ))}
        </div>

        {/* Actions (Clear, Download, Close) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleClear}
            title="Clear canvas"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} /> Clear
          </button>

          <button
            onClick={handleDownload}
            title="Save PNG"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFF',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Save
          </button>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFF',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            width: '100%',
            height: '100%',
            cursor: tool === 'eraser' ? 'crosshair' : 'pointer',
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
}
