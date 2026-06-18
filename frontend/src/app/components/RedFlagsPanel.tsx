'use client';

import { useState } from 'react';
import type { RedFlag } from '../lib/api';

interface RedFlagsPanelProps {
  flags: RedFlag[];
  showTamil: boolean;
}

const RISK_CONFIG = {
  high: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'High Risk', icon: '🔴' },
  medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Medium Risk', icon: '🟡' },
  low: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Low Risk', icon: '🔵' },
};

export default function RedFlagsPanel({ flags, showTamil }: RedFlagsPanelProps) {
  const [openId, setOpenId] = useState<number | null>(0);

  if (!flags || flags.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#16a34a' }}>No red flags found</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>This document appears to have fair and standard clauses.</p>
      </div>
    );
  }

  const sorted = [...flags].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.risk] - order[b.risk];
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['high', 'medium', 'low'] as const).map(risk => {
          const count = flags.filter(f => f.risk === risk).length;
          if (count === 0) return null;
          const rc = RISK_CONFIG[risk];
          return (
            <span key={risk} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px', borderRadius: 99, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontWeight: 600 }}>
              {rc.icon} {count} {rc.label}
            </span>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((flag, i) => {
          const rc = RISK_CONFIG[flag.risk];
          const isOpen = openId === i;
          return (
            <div key={i} style={{ border: `1px solid ${isOpen ? rc.border : 'var(--border)'}`, borderLeft: `3px solid ${rc.color}`, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
              <button onClick={() => setOpenId(isOpen ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{rc.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{flag.clause}</p>
                  <span style={{ fontSize: 10, color: rc.color, fontWeight: 600 }}>{rc.label}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {isOpen && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: showTamil ? 8 : 0 }}>{flag.explanation}</p>
                  {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>{flag.explanation_tamil}</p>}
                  {flag.originalText && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Original Text</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>"{flag.originalText}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
