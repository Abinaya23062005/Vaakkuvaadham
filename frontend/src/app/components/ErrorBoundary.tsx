'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Renders a smaller, inline fallback instead of a full-page takeover.
   *  Use this when wrapping a section of the page (like one results tab)
   *  rather than the whole app, so a crash in one tab doesn't look like
   *  the entire site went down. */
  compact?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches JavaScript errors anywhere in the component tree below it and
 * shows a recoverable fallback UI instead of an unrecoverable white screen.
 *
 * Why this matters specifically for NyayaAI: the AI (Groq) occasionally
 * returns malformed or unexpected JSON shapes (missing fields, wrong types).
 * Without this boundary, something like `analysis.redFlags.map(...)` throwing
 * because redFlags is undefined would crash the ENTIRE React tree — including
 * the navbar, sign-in button, everything — with no way to recover except a
 * full page refresh. That's exactly the kind of failure that looks worst
 * during a live demo or interview walkthrough.
 *
 * React error boundaries only catch errors during rendering, lifecycle
 * methods, and constructors — NOT inside async callbacks or event handlers
 * (those are already handled by try/catch in page.tsx). This boundary is
 * the safety net for the cases try/catch can't reach.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production you'd send this to an error-tracking service
    // (Sentry, LogRocket, etc). For now, at least log it clearly.
    console.error('NyayaAI crashed:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleFullReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.compact) {
        return (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #1a1714)', marginBottom: 4 }}>
              This section couldn't load
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted, #9e9890)', marginBottom: 16 }}>
              The rest of your analysis is still fine — just this tab hit a snag.
            </p>
            <button onClick={this.handleReset} style={{ background: 'var(--primary, #e85d26)', color: 'white', border: 'none', borderRadius: 9, padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Retry this section
            </button>
          </div>
        );
      }

      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-tertiary, #f2efe9)' }}>
          <div style={{ maxWidth: 460, width: '100%', background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e2dc)', borderRadius: 20, padding: 36, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 28 }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary, #1a1714)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #6b6560)', lineHeight: 1.6, marginBottom: 4 }}>
              NyayaAI hit an unexpected error while displaying this page. This is usually temporary — your document was not lost.
            </p>
            <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted, #9e9890)', lineHeight: 1.7, marginBottom: 24 }}>
              எதிர்பாராத பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={this.handleReset} style={{ background: 'var(--primary, #e85d26)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Try Again
              </button>
              <button onClick={this.handleFullReload} style={{ background: 'var(--bg-secondary, #f8f7f4)', color: 'var(--text-secondary, #6b6560)', border: '1px solid var(--border, #e5e2dc)', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Reload App
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: 20, textAlign: 'left' }}>
                <summary style={{ fontSize: 11, color: 'var(--text-muted, #9e9890)', cursor: 'pointer' }}>Error details (dev only)</summary>
                <pre style={{ fontSize: 10, color: '#dc2626', background: '#fef2f2', padding: 10, borderRadius: 8, marginTop: 8, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
