'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'magic';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, sendMagicLink, isOfflineMode } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Close modal on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'magic') {
        const { error, message: msg } = await sendMagicLink(email);
        if (error) throw error;
        setMessage({ type: 'success', text: msg || 'Magic link sent! Check your inbox.' });
      } else if (mode === 'signin') {
        const { error, message: msg } = await signIn(email, password);
        if (error) throw error;
        setMessage({ type: 'success', text: msg || 'Welcome back!' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const { error, message: msg } = await signUp(email, password);
        if (error) throw error;
        setMessage({ type: 'success', text: msg || 'Account created successfully!' });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication operation failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div className="auth-modal-card" style={{
        background: 'rgba(10, 10, 10, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(16px)',
        transform: 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          className="auth-close-btn"
          aria-label="Close dialog"
        >
          <X size={14} />
        </button>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '10px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(168,85,247,0.2)',
            marginBottom: '12px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Sparkles size={20} style={{ color: '#a855f7' }} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '4px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #A3A3A3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to Drip AI
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Elevate your personal style coordinate engine
          </p>
        </div>

        {/* Offline Mode Banner Alert */}
        {isOfflineMode && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px dashed rgba(234, 179, 8, 0.25)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#eab308',
              display: 'inline-block'
            }} />
            <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 500 }}>
              Offline Mode active. Actions are fully simulated.
            </span>
          </div>
        )}

        {/* Segmented Auth Control Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '2px',
          marginBottom: '20px'
        }}>
          {(['signin', 'signup', 'magic'] as AuthMode[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setMode(t);
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: mode === t ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: mode === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                boxShadow: mode === t ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
              }}
            >
              {t === 'signin' ? 'Sign In' : t === 'signup' ? 'Sign Up' : 'Magic Link'}
            </button>
          ))}
        </div>

        {/* Feedback Messages */}
        {message && (
          <div style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.78rem',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={14} />
            <span>{message.text}</span>
          </div>
        )}

        {/* Auth Input Fields Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              display: 'block',
              marginBottom: '6px'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                required
                className="interactiveInput"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  paddingLeft: '34px',
                  width: '100%',
                  height: '38px',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <label style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                display: 'block',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={13} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="password"
                  required
                  className="interactiveInput"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '34px',
                    width: '100%',
                    height: '38px',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="prompt-submit-btn drip-submit-gradient"
            style={{
              width: '100%',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
              marginTop: '8px'
            }}
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Access Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
