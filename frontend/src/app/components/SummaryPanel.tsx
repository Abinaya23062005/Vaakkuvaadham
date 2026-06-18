'use client';

import type { Analysis } from '../lib/api';
import { DOC_TYPE_LABELS } from '../lib/api';

interface SummaryPanelProps {
  analysis: Analysis;
  showTamil: boolean;
  viewMode: 'english' | 'tamil' | 'split';
}

const CATEGORY_ICONS: Record<string, string> = {
  Rights: '⚖️', Obligations: '📋', Duration: '📅', Financial: '💰',
  Termination: '🔚', Dispute: '⚡', Notice: '📢', Other: '📌',
};

export default function SummaryPanel({ analysis, showTamil, viewMode }: SummaryPanelProps) {
  const cardStyle = {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 16,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Doc type + meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={{
          background: 'rgba(232,93,38,0.1)', color: 'var(--primary)',
          border: '1px solid rgba(232,93,38,0.2)', borderRadius: 99,
          padding: '4px 12px', fontSize: 12, fontWeight: 600,
        }}>
          {DOC_TYPE_LABELS[analysis.documentType] || '📄 Legal Document'}
        </span>
        {analysis.jurisdiction && (
          <span style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--text-secondary)',
          }}>
            📍 {analysis.jurisdiction}
          </span>
        )}
      </div>

      {/* Summary */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Summary</p>
        {viewMode === 'split' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={cardStyle}>
              <p style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>🇮🇳 ENGLISH</p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.summary}</p>
            </div>
            <div style={cardStyle}>
              <p style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, marginBottom: 6 }}>🔤 தமிழ்</p>
              <p className="tamil" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.9 }}>{analysis.summary_tamil}</p>
            </div>
          </div>
        ) : (
          <div style={cardStyle}>
            <p className={viewMode === 'tamil' ? 'tamil' : ''} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {viewMode === 'tamil' ? analysis.summary_tamil : analysis.summary}
            </p>
          </div>
        )}
      </div>

      {/* Key facts */}
      {((analysis.keyParties?.length ?? 0) > 0 || (analysis.importantDates?.length ?? 0) > 0 || (analysis.financialTerms?.length ?? 0) > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {analysis.keyParties?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>👥 PARTIES</p>
              {analysis.keyParties.map((p, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.role}: </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name || '—'}</span>
                </div>
              ))}
            </div>
          )}
          {analysis.importantDates?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>📅 DATES</p>
              {analysis.importantDates.map((d, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}: </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.date}</span>
                </div>
              ))}
            </div>
          )}
          {analysis.financialTerms?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>💰 FINANCIALS</p>
              {analysis.financialTerms.map((f, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.label}: </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{f.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Key points */}
      {analysis.summaryPoints?.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Key Points</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.summaryPoints.map((pt, i) => (
              <div key={i} style={{
                ...cardStyle, display: 'flex', gap: 12, alignItems: 'flex-start',
                transition: 'border-color 0.15s',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{CATEGORY_ICONS[pt.category] || '📌'}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{pt.category}</span>
                  {viewMode === 'split' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pt.point}</p>
                      <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>{pt.point_tamil}</p>
                    </div>
                  ) : (
                    <p className={viewMode === 'tamil' ? 'tamil' : ''} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>
                      {viewMode === 'tamil' ? pt.point_tamil : pt.point}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
