'use client';

import { useState, useEffect } from 'react';
import { getNegotiationTips } from '../lib/api';
import type { Analysis } from '../lib/api';

interface NegotiationCoachProps {
  analysis: Analysis;
  showTamil: boolean;
}

interface Tip {
  flagClause: string;
  whatToSay: string;
  whatToSay_tamil: string;
  suggestedReplacement: string;
  likelihood: 'high' | 'medium' | 'low';
}

const LIKELIHOOD_CONFIG = {
  high: { color: '#16a34a', label: 'High success rate' },
  medium: { color: '#d97706', label: 'Medium success rate' },
  low: { color: '#dc2626', label: 'May be difficult' },
};

export default function NegotiationCoach({ analysis, showTamil }: NegotiationCoachProps) {
  const [tips, setTips] = useState<Tip[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if ((analysis.redFlags?.length || 0) > 0) {
      loadTips();
    }
  }, []);

  const loadTips = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getNegotiationTips(analysis);
      setTips(result.tips || []);
    } catch {
      setError('Could not load negotiation tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if ((analysis.redFlags?.length || 0) === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>No negotiation needed</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>This document looks fair — no red flags to negotiate.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Negotiation Coach</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 30 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generating negotiation scripts...</p>
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {error}</p>}

      {tips && tips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tips.map((tip, i) => {
            const lc = LIKELIHOOD_CONFIG[tip.likelihood];
            return (
              <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{tip.flagClause}</p>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: lc.color + '15', color: lc.color, fontWeight: 600 }}>{lc.label}</span>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>What to say</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{tip.whatToSay}"</p>
                  {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 4 }}>"{tip.whatToSay_tamil}"</p>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Suggested replacement</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip.suggestedReplacement}</p>
                  </div>
                  <button onClick={() => copyText(tip.whatToSay, i)} style={{ flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {copiedIdx === i ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
