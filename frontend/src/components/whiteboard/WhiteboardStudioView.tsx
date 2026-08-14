'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  Highlighter,
  Trash2,
  Download,
  RotateCcw,
  Square,
  Circle,
  StickyNote,
  Plus,
  ArrowLeft,
  Users,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { User } from '@/types';

interface WhiteboardStudioViewProps {
  currentUser: User;
}

interface WhiteboardDoc {
  id: string;
  title: string;
  updatedAt: string;
  thumbnailColor: string;
  author: string;
}

const SAMPLE_BOARDS: WhiteboardDoc[] = [
  {
    id: 'wb-1',
    title: 'Architecture & SFU WebRTC Flow',
    updatedAt: '10 mins ago',
    thumbnailColor: '#0E71EB',
    author: 'Rishabh',
  },
  {
    id: 'wb-2',
    title: 'Sprint 42 Retrospective & Action Items',
    updatedAt: '2 hours ago',
    thumbnailColor: '#10B981',
    author: 'Ananya Iyer',
  },
  {
    id: 'wb-3',
    title: 'Design System & Component Library',
    updatedAt: 'Yesterday',
    thumbnailColor: '#8B5CF6',
    author: 'Aarav Patel',
  },
];

export function WhiteboardStudioView({ currentUser }: WhiteboardStudioViewProps) {
  const [boards, setBoards] = useState<WhiteboardDoc[]>(SAMPLE_BOARDS);
  const [activeBoard, setActiveBoard] = useState<WhiteboardDoc | null>(null);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [color, setColor] = useState('#0E71EB');
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPoint, setPrevPoint] = useState<{ x: number; y: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const colors = ['#FFFFFF', '#0E71EB', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

  // Initialize canvas when entering editor mode
  useEffect(() => {
    if (!activeBoard) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.parentElement?.clientWidth || 1000;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#161922';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint dot grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let x = 20; x < canvas.width; x += 30) {
        for (let y = 20; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [activeBoard]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPrevPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !prevPoint) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(x, y);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#161922';
      ctx.lineWidth = lineWidth * 4;
      ctx.globalAlpha = 1.0;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 3;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setPrevPoint({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setPrevPoint(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#161922';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${activeBoard?.title || 'whiteboard'}.png`;
    a.click();
  };

  const handleCreateNewBoard = () => {
    const newBoard: WhiteboardDoc = {
      id: `wb-${Date.now()}`,
      title: `Untitled Whiteboard ${boards.length + 1}`,
      updatedAt: 'Just now',
      thumbnailColor: '#0E71EB',
      author: currentUser.name,
    };
    setBoards((prev) => [newBoard, ...prev]);
    setActiveBoard(newBoard);
  };

  const handleCopyShareLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 1. GALLERY VIEW
  if (!activeBoard) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 120px)',
          backgroundColor: '#11141D',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              Zoom Whiteboards
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
              Create diagrams, wireframes, agile sprint retros, and brainstorm visually.
            </p>
          </div>

          <button
            onClick={handleCreateNewBoard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0E71EB',
              color: '#FFFFFF',
              padding: '9px 20px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(14, 113, 235, 0.4)',
            }}
          >
            <Plus size={16} /> New Whiteboard
          </button>
        </div>

        {/* Whiteboards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Create Card Button */}
          <button
            onClick={handleCreateNewBoard}
            style={{
              height: '180px',
              borderRadius: '14px',
              border: '2px dashed rgba(14, 113, 235, 0.4)',
              backgroundColor: 'rgba(14, 113, 235, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: '#0E71EB',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 113, 235, 0.1)';
              e.currentTarget.style.borderColor = '#0E71EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 113, 235, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(14, 113, 235, 0.4)';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(14, 113, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={22} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>Create New Board</span>
          </button>

          {/* Existing Boards */}
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => setActiveBoard(board)}
              style={{
                height: '180px',
                borderRadius: '14px',
                backgroundColor: '#161922',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#0E71EB';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Top Preview Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: `${board.thumbnailColor}22`,
                    color: board.thumbnailColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PenTool size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF' }}>{board.title}</h4>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>By {board.author}</div>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Edited {board.updatedAt}</span>
                <span style={{ fontSize: '12px', color: '#0E71EB', fontWeight: '700' }}>Open Canvas →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ACTIVE CANVAS STUDIO EDITOR VIEW
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#11141D',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Studio Header Bar */}
      <div
        style={{
          height: '56px',
          backgroundColor: '#161922',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setActiveBoard(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <ArrowLeft size={16} /> All Boards
          </button>

          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>{activeBoard.title}</span>
        </div>

        {/* Right Tools: Share, Download, Clear */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCopyShareLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: copiedLink ? '#10B981' : '#FFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleDownload}
            title="Download as PNG"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0E71EB',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Download size={14} /> Export PNG
          </button>

          <button
            onClick={handleClear}
            title="Clear canvas"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Floating Toolbar & Interactive Canvas Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Floating Tools Dock */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1E2330',
            borderRadius: '12px',
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
          }}
        >
          {/* Tool Selector */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setTool('pen')}
              title="Pen Tool"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: tool === 'pen' ? '#0E71EB' : 'transparent',
                color: '#FFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <PenTool size={16} />
            </button>

            <button
              onClick={() => setTool('highlighter')}
              title="Highlighter"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: tool === 'highlighter' ? '#0E71EB' : 'transparent',
                color: '#FFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Highlighter size={16} />
            </button>

            <button
              onClick={() => setTool('eraser')}
              title="Eraser"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: tool === 'eraser' ? '#0E71EB' : 'transparent',
                color: '#FFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Eraser size={16} />
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Color Palette */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid #FFF' : '1px solid rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Stroke Width Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[2, 4, 8, 14].map((size) => (
              <button
                key={size}
                onClick={() => setLineWidth(size)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: lineWidth === size ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(size + 2, 14)}px`,
                    height: `${Math.min(size + 2, 14)}px`,
                    borderRadius: '50%',
                    backgroundColor: '#FFF',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ width: '100%', height: '100%', display: 'block', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
        />
      </div>
    </div>
  );
}
