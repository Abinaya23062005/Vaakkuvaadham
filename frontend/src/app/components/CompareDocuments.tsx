'use client';

import { useState } from 'react';
import { compareDocuments } from '../lib/api';
import type { Analysis } from '../lib/api';

interface CompareDocumentsProps {
  currentAnalysis: Analysis;
  showTamil: boolean;
}

interface CompareResult {
  verdict: 'better' | 'worse' | 'similar';
  summary: string;
  summary_tamil: string;
  additions: string[];
  removals: string[];
  modifications: string[];
}

const VERDICT_CONFIG = {
  better: { color: '#16a34a', icon: '✅', label: 'New version is better' },
  worse: { color: '#dc2626', icon: '⚠️', label: 'New version is worse' },
  similar: { color: '#2563eb', icon: 'ℹ️', label: 'Versions are similar' },
};

export default function CompareDocuments({ currentAnalysis, showTamil }: CompareDocumentsProps) {
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (newText.trim().length < 100) {
      setError('Please paste at least 100 characters of the new document.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await compareDocuments(currentAnalysis, newText);
      setResult(res);
    } catch {
      setError('Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Compare with New Version</span>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        Paste the text of a revised or renewed version of this document to see what changed.
      </p>

      <textarea value={newText} onChange={e => setNewText(e.target.value)}
        placeholder="Paste the new document text here..."
        style={{ width: '100%', minHeight: 140, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit', marginBottom: 12 }} />

      <button onClick={handleCompare} disabled={loading || newText.trim().length < 100} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || newText.trim().length < 100 ? 0.5 : 1 }}>
        {loading ? 'Comparing...' : 'Compare Documents'}
      </button>

      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 10 }}>⚠️ {error}</p>}

      {result && (
        <div style={{ marginTop: 20 }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: VERDICT_CONFIG[result.verdict].color + '10', border: `1px solid ${VERDICT_CONFIG[result.verdict].color}30`, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>{VERDICT_CONFIG[result.verdict].icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: VERDICT_CONFIG[result.verdict].color }}>{VERDICT_CONFIG[result.verdict].label}</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: showTamil ? 8 : 16 }}>{result.summary}</p>
          {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16 }}>{result.summary_tamil}</p>}

          {result.additions?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>+ Added</p>
              {result.additions.map((a, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {a}</p>)}
            </div>
          )}
          {result.removals?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 6 }}>− Removed</p>
              {result.removals.map((r, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {r}</p>)}
            </div>
          )}
          {result.modifications?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: 6 }}>~ Modified</p>
              {result.modifications.map((m, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>• {m}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
