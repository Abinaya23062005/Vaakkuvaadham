'use client';

import { useState, useEffect } from 'react';
import type { Analysis } from '../lib/api';

interface HistoryEntry {
  id: string;
  fileName: string;
  documentType: string;
  overallRisk: string;
  score: number;
  redFlagCount: number;
  summary: string;
  analyzedAt: string;
  analysis: Analysis;
}

interface DocumentHistoryProps {
  onRestore: (analysis: Analysis, fileName: string) => void;
  showTamil: boolean;
}

const RISK_COLORS: Record<string, string> = { high: '#dc2626', medium: '#d97706', low: '#2563eb', safe: '#16a34a' };
const DOC_LABELS: Record<string, string> = {
  rental_agreement: 'Rental Agreement',
  job_offer: 'Job Offer',
  court_notice: 'Court Notice',
  other: 'Legal Document',
};

export const saveToHistory = (analysis: Analysis, fileName: string) => {
  try {
    const existing = JSON.parse(localStorage.getItem('nyayaai_history') || '[]');
    const flags = analysis.redFlags || [];
    let score = 100;
    flags.forEach(f => {
      if (f.risk === 'high') score -= 18;
      else if (f.risk === 'medium') score -= 8;
      else score -= 3;
    });
    score = Math.max(10, Math.min(100, score));

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      fileName,
      documentType: analysis.documentType || 'other',
      overallRisk: analysis.overallRisk,
      score,
      redFlagCount: flags.filter(f => f.risk === 'high').length,
      summary: analysis.summary?.slice(0, 120) || '',
      analyzedAt: new Date().toISOString(),
      analysis,
    };
    const updated = [entry, ...existing].slice(0, 20); // keep last 20
    localStorage.setItem('nyayaai_history', JSON.stringify(updated));
  } catch {}
};

export default function DocumentHistory({ onRestore, showTamil }: DocumentHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyayaai_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('nyayaai_history');
    setHistory([]);
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('nyayaai_history', JSON.stringify(updated));
  };

  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 12px', display: 'block' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No analysis history yet</p>
        <p style={{ fontSize: 13 }}>Your analyzed documents will appear here</p>
        {showTamil && <p className="tamil" style={{ fontSize: 12, marginTop: 4 }}>உங்கள் பகுப்பாய்வு வரலாறு இங்கே தோன்றும்</p>}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {history.length} document{history.length > 1 ? 's' : ''} analyzed
          {showTamil && <span className="tamil" style={{ marginLeft: 6 }}>{history.length} ஆவணங்கள்</span>}
        </p>
        <button onClick={clearHistory} style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 6,
          padding: '4px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {history.map(entry => {
          const color = RISK_COLORS[entry.overallRisk] || '#16a34a';
          const isSelected = selected === entry.id;
          return (
            <div key={entry.id} style={{
              background: 'var(--bg-secondary)', border: `1px solid ${isSelected ? color + '50' : 'var(--border)'}`,
              borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s',
            }}>
              <div
                onClick={() => setSelected(isSelected ? null : entry.id)}
                style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                {/* Score circle */}
                <div style={{
                  width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                  background: color + '15', border: `2px solid ${color}40`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1 }}>{entry.score}</span>
                  <span style={{ fontSize: 8, color, fontWeight: 500 }}>/100</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.fileName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 99,
                      background: color + '15', color, border: `1px solid ${color}30`, fontWeight: 600,
                    }}>
                      {entry.overallRisk.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {DOC_LABELS[entry.documentType]}
                    </span>
                    {entry.redFlagCount > 0 && (
                      <span style={{ fontSize: 11, color: '#dc2626' }}>
                        {entry.redFlagCount} high risk
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                    {new Date(entry.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: isSelected ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {isSelected && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {entry.summary}...
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => onRestore(entry.analysis, entry.fileName)}
                      style={{
                        flex: 1, background: 'var(--primary)', color: 'white', border: 'none',
                        borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      View Full Analysis
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '8px 14px', fontSize: 12,
                        color: 'var(--text-muted)', cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
