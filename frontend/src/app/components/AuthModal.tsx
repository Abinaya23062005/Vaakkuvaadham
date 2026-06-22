'use client';

import { useState, useEffect } from 'react';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  plan: 'free' | 'pro';
  analysisCount: number;
  monthYear: string;
  totalAnalyses: number;
  paidCredits: number;
}

export const FREE_LIMIT = 10;
export const PAYMENT_AMOUNT = 49;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AppUser) => void;
}

// Firebase error messages
const ERROR_MAP: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email. Please sign up.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered. Please sign in.',
  'auth/invalid-email': 'Invalid email address format.',
  'auth/weak-password': 'Password too weak. Use at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
  'auth/popup-blocked': 'Pop-up blocked. Please allow pop-ups for this site in browser settings.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
};

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(''); setEmail(''); setPassword(''); setName(''); setResetSent(false); setMode('login');
      // Check if Firebase is configured
      const isConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY';
      setFirebaseReady(!!isConfigured);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    if (!firebaseReady) {
      setError('Firebase is not configured yet. See setup instructions below.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      // Dynamic import to avoid errors if Firebase not configured
      const { signInWithGoogle, getOrCreateUserDoc } = await import('../lib/firebase');
      const firebaseUser = await signInWithGoogle();
      const userDoc = await getOrCreateUserDoc(firebaseUser);
      onLogin({
        uid: userDoc.uid,
        name: userDoc.name,
        email: userDoc.email,
        photoURL: userDoc.photoURL,
        plan: userDoc.plan,
        analysisCount: userDoc.analysisCount,
        monthYear: userDoc.monthYear,
        totalAnalyses: userDoc.totalAnalyses,
        paidCredits: userDoc.paidCredits || 0,
      });
      onClose();
    } catch (err: any) {
      setError(ERROR_MAP[err.code] || err.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    if (!firebaseReady) { setError('Firebase is not configured yet. See setup instructions below.'); return; }

    setLoading(true);
    setError('');
    try {
      const { signInWithEmail, signUpWithEmail, getOrCreateUserDoc } = await import('../lib/firebase');
      const firebaseUser = mode === 'signup'
        ? await signUpWithEmail(email.trim(), password, name.trim())
        : await signInWithEmail(email.trim(), password);
      const userDoc = await getOrCreateUserDoc(firebaseUser);
      onLogin({
        uid: userDoc.uid,
        name: userDoc.name,
        email: userDoc.email,
        photoURL: userDoc.photoURL,
        plan: userDoc.plan,
        analysisCount: userDoc.analysisCount,
        monthYear: userDoc.monthYear,
        totalAnalyses: userDoc.totalAnalyses,
        paidCredits: userDoc.paidCredits || 0,
      });
      onClose();
    } catch (err: any) {
      setError(ERROR_MAP[err.code] || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    if (!firebaseReady) { setError('Firebase is not configured yet. See setup instructions below.'); return; }

    setLoading(true);
    setError('');
    try {
      const { resetPassword } = await import('../lib/firebase');
      await resetPassword(email.trim());
      // Always show success, even if the email doesn't have an account.
      // This is intentional: revealing "no account with this email" would
      // let someone enumerate which emails are registered on NyayaAI.
      setResetSent(true);
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many reset attempts. Please wait a few minutes and try again.');
      } else {
        // Same reasoning as above — don't leak account existence on generic errors either.
        setResetSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '11px 14px', fontSize: 14, color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative', animation: 'slideUp 0.25s ease', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 20px rgba(232,93,38,0.4)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M8 7H3l3 6-3 6h5M16 7h5l-3 6 3 6h-5M8 7h8"/></svg>
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 3 }}>
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Sign in to your NyayaAI account' : mode === 'signup' ? 'Join NyayaAI — free forever' : "We'll email you a link to reset it"}
          </p>
        </div>

        {/* Free plan info — hidden during password reset, not relevant there */}
        {mode !== 'reset' && (
          <div style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🎉</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Free Plan — {FREE_LIMIT} analyses per month</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                  After {FREE_LIMIT} free analyses, pay just ₹{PAYMENT_AMOUNT} per document. No subscription — pay only when you need.
                </p>
                <p className="tamil" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  மாதம் {FREE_LIMIT} பகுப்பாய்வுகள் இலவசம் · பிறகு ₹{PAYMENT_AMOUNT} மட்டும்
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Firebase not configured warning */}
        {!firebaseReady && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 4 }}>⚙️ Setup Required</p>
            <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>
              Add your Firebase config to <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>.env.local</code>:
            </p>
            <pre style={{ fontSize: 10, color: '#78350f', marginTop: 6, lineHeight: 1.8, background: '#fef9e7', padding: '6px 8px', borderRadius: 6, overflow: 'auto' }}>{`NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx`}</pre>
            <p style={{ fontSize: 10, color: '#92400e', marginTop: 4 }}>
              Get config from <strong>console.firebase.google.com</strong> → Project Settings
            </p>
          </div>
        )}

        {/* Password reset mode — its own self-contained flow */}
        {mode === 'reset' ? (
          <div>
            {resetSent ? (
              <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 22 }}>✉️</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Check your inbox</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 4 }}>
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link. It may take a minute to arrive — check spam too.
                </p>
                <p className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 18 }}>
                  உங்கள் மின்னஞ்சலை சரிபார்க்கவும்
                </p>
                <button onClick={() => { setMode('login'); setResetSent(false); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email Address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                    onKeyDown={e => e.key === 'Enter' && handlePasswordReset()}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,38,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style={{ fontSize: 12, color: '#dc2626', lineHeight: 1.5 }}>{error}</p>
                  </div>
                )}

                <button onClick={handlePasswordReset} disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 16px rgba(232,93,38,0.35)' }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 2 }}>
                  ← Back to Sign In
                </button>
              </div>
            )}
          </div>
        ) : (
        <>

        {/* Google button */}
        <button onClick={handleGoogleLogin} disabled={googleLoading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: googleLoading ? 'not-allowed' : 'pointer', marginBottom: 14, transition: 'all 0.15s', opacity: googleLoading ? 0.6 : 1 }}
          onMouseEnter={e => !googleLoading && ((e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)')}
        >
          {googleLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
              <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Opening Google sign-in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,38,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,38,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('reset'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  Forgot password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 characters"
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,93,38,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                {showPassword
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: 12, color: '#dc2626', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <button onClick={handleEmailAuth} disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: '0 4px 16px rgba(232,93,38,0.35)', marginTop: 2 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up free →' : 'Sign in →'}
          </button>
        </p>
        <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          By continuing you agree to NyayaAI Terms of Service · Your data is never sold
        </p>
        </>
        )}
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
