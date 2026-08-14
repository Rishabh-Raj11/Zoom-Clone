'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Video,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('rishabh@zoomclone.dev');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await login(email.trim(), password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setEmail('rishabh@zoomclone.dev');
    setPassword('password123');
    setIsSubmitting(true);
    setError(null);
    const res = await login('rishabh@zoomclone.dev', 'password123');
    if (res.success) {
      router.push('/');
    } else {
      setError('Demo login failed. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Mesh */}
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 113, 235, 0.18) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel-heavy animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-2xl)',
          padding: '40px 36px',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(14, 113, 235, 0.15)',
          border: '1px solid var(--border-medium)',
          zIndex: 2,
          position: 'relative',
        }}
      >
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--zoom-blue-gradient)',
              boxShadow: 'var(--shadow-blue-glow)',
              marginBottom: '16px',
            }}
          >
            <Video size={30} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.4px' }}>
            Sign In to Zoom
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enterprise Workspace & Video Conference Engine
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#F87171',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Fast Track Pill */}
        <button
          type="button"
          onClick={handleDemoSignIn}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'rgba(14, 113, 235, 0.12)',
            color: 'var(--zoom-blue-hover)',
            border: '1px solid rgba(14, 113, 235, 0.3)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '22px',
          }}
        >
          <Zap size={15} /> 1-Click Instant Demo Login (Rishabh)
        </button>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Work Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                style={{ width: '100%', paddingLeft: '40px', fontSize: '14px', fontWeight: '600' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Password
              </label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--zoom-blue-hover)', textDecoration: 'none', fontWeight: '600' }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', fontSize: '14px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--zoom-blue)' }}
            />
            <span>Keep me signed in on this device</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'var(--zoom-blue-gradient)',
              color: '#FFFFFF',
              padding: '13px 24px',
              borderRadius: 'var(--radius-full)',
              fontSize: '15px',
              fontWeight: '800',
              boxShadow: 'var(--shadow-blue-glow)',
              marginTop: '6px',
            }}
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Footer Link to Signup */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have a Zoom account?{' '}
          <Link href="/signup" style={{ color: 'var(--zoom-blue-hover)', fontWeight: '700', textDecoration: 'none' }}>
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  );
}
