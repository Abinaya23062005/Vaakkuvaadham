'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { icon: '📖', label: 'Extracting text from PDF...', tamil: 'PDF இல் இருந்து உரை பிரிக்கிறோம்...' },
  { icon: '🤖', label: 'AI is reading your document...', tamil: 'AI உங்கள் ஆவணத்தை படிக்கிறது...' },
  { icon: '🚩', label: 'Detecting risky clauses...', tamil: 'ஆபத்தான விதிகளை கண்டறிகிறோம்...' },
  { icon: '🌐', label: 'Translating to Tamil...', tamil: 'தமிழில் மொழிபெயர்க்கிறோம்...' },
];

interface ProcessingProps {
  fileName: string;
  uploadProgress: number;
}

export default function Processing({ fileName, uploadProgress }: ProcessingProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => s < STEPS.length - 1 ? s + 1 : s);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 20, padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-md)',
    }}>
      {/* Spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          animation: 'spin 1s linear infinite',
          position: 'absolute', inset: 0,
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>
          {STEPS[step].icon}
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Analyzing</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>{fileName}</p>

      {/* Steps */}
      <div style={{ textAlign: 'left', marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
            borderRadius: 8, marginBottom: 4,
            background: i === step ? 'rgba(232,93,38,0.06)' : 'transparent',
            opacity: i > step ? 0.3 : 1, transition: 'all 0.4s',
          }}>
            <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{s.icon}</span>
            <div>
              <p style={{
                fontSize: 13, fontWeight: i === step ? 600 : 400,
                color: i === step ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}>{s.label}</p>
              <p className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.tamil}</p>
            </div>
            {i < step && <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: 14 }}>✓</span>}
          </div>
        ))}
      </div>

      {/* Upload progress */}
      {uploadProgress < 100 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Uploading</span><span>{uploadProgress}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: 'var(--primary)',
              width: `${uploadProgress}%`, transition: 'width 0.3s', borderRadius: 99,
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
