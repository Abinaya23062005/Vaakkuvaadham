'use client';

import { useState, useRef } from 'react';
import type { Analysis } from '../lib/api';

interface VoiceSummaryProps {
  analysis: Analysis;
  showTamil: boolean;
}

export default function VoiceSummary({ analysis, showTamil }: VoiceSummaryProps) {
  const [playing, setPlaying] = useState<'en' | 'ta' | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = (text: string, lang: 'en' | 'ta') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setPlaying(null);
    utterance.onerror = () => setPlaying(null);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(lang);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(null);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Listen to summary:</span>

      <button onClick={() => playing === 'en' ? stop() : speak(analysis.summary, 'en')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: playing === 'en' ? 'var(--primary)' : 'var(--bg-secondary)', color: playing === 'en' ? 'white' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        {playing === 'en' ? '⏸' : '▶'} English
      </button>

      <button onClick={() => playing === 'ta' ? stop() : speak(analysis.summary_tamil, 'ta')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: playing === 'ta' ? 'var(--primary)' : 'var(--bg-secondary)', color: playing === 'ta' ? 'white' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        <span className="tamil">{playing === 'ta' ? '⏸' : '▶'} தமிழ்</span>
      </button>

      {playing && (
        <button onClick={stop} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          ⏹ Stop
        </button>
      )}
    </div>
  );
}
