'use client';

import { useRef, useState } from 'react';
import type { Analysis } from '../lib/api';

interface RiskScoreCardProps {
  analysis: Analysis;
  fileName: string;
  showTamil: boolean;
}

const calculateScore = (analysis: Analysis): number => {
  let score = 100;
  const flags = analysis.redFlags || [];
  flags.forEach(f => {
    if (f.risk === 'high') score -= 18;
    else if (f.risk === 'medium') score -= 8;
    else if (f.risk === 'low') score -= 3;
  });
  if (analysis.overallRisk === 'high') score = Math.min(score, 35);
  else if (analysis.overallRisk === 'medium') score = Math.min(score, 65);
  else if (analysis.overallRisk === 'safe') score = Math.max(score, 80);
  return Math.max(10, Math.min(100, score));
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#2563eb';
  if (score >= 40) return '#d97706';
  return '#dc2626';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return { en: 'Safe to Sign', ta: 'கையெழுத்திட பாதுகாப்பானது' };
  if (score >= 60) return { en: 'Review Carefully', ta: 'கவனமாக சரிபாருங்கள்' };
  if (score >= 40) return { en: 'Multiple Concerns', ta: 'பல கவலைகள் உள்ளன' };
  return { en: 'High Risk — Do Not Sign', ta: 'அதிக ஆபத்து — கையெழுத்திட வேண்டாம்' };
};

export default function RiskScoreCard({ analysis, fileName, showTamil }: RiskScoreCardProps) {
  const [copied, setCopied] = useState(false);
  const score = calculateScore(analysis);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const shareText = () => {
    const text = `📋 NyayaAI Document Analysis\n\n` +
      `Document: ${fileName}\n` +
      `Risk Score: ${score}/100 — ${label.en}\n` +
      `Red Flags: ${analysis.redFlags?.filter(f => f.risk === 'high').length || 0} high risk\n\n` +
      `Summary: ${analysis.summary?.slice(0, 200)}...\n\n` +
      `Analyzed by NyayaAI — nyayaai.in`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `📋 *NyayaAI Legal Analysis*\n\n` +
      `📄 ${fileName}\n` +
      `🎯 Risk Score: *${score}/100*\n` +
      `Status: *${label.en}*\n` +
      `🚩 High Risk Clauses: ${analysis.redFlags?.filter(f => f.risk === 'high').length || 0}\n\n` +
      `${analysis.summary_tamil || analysis.summary}\n\n` +
      `_Analyzed by NyayaAI_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Document Risk Score</span>
        {showTamil && <span className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)' }}>ஆவண ஆபத்து மதிப்பெண்</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        {/* Circular score */}
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
            {/* Score arc */}
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
          </div>
        </div>

        {/* Score details */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: color + '15', border: `1px solid ${color}30`,
            borderRadius: 99, padding: '5px 14px', marginBottom: 12,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color }}>{label.en}</span>
          </div>
          {showTamil && (
            <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{label.ta}</p>
          )}

          {/* Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'High Risk Clauses', count: analysis.redFlags?.filter(f => f.risk === 'high').length || 0, color: '#dc2626' },
              { label: 'Medium Risk Clauses', count: analysis.redFlags?.filter(f => f.risk === 'medium').length || 0, color: '#d97706' },
              { label: 'Low Risk Clauses', count: analysis.redFlags?.filter(f => f.risk === 'low').length || 0, color: '#2563eb' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <button onClick={shareWhatsApp} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 10, border: 'none',
          background: '#25d366', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share Score
        </button>
        <button onClick={shareText} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '9px 0', borderRadius: 10,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {copied ? <polyline points="20 6 9 17 4 12"/> : <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>}
          </svg>
          {copied ? 'Copied!' : 'Copy Score'}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
        Share your score to help others understand legal risks · nyayaai.in
      </p>
    </div>
  );
}
