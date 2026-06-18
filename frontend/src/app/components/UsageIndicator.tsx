'use client';

import type { AppUser } from './AuthModal';

interface UsageIndicatorProps {
  user: AppUser;
  onUpgrade?: () => void;
  compact?: boolean;
}

export const FREE_LIMIT = 10;

export default function UsageIndicator({ user, onUpgrade, compact }: UsageIndicatorProps) {
  const used = user.analysisCount;
  const remaining = Math.max(0, FREE_LIMIT - used);
  const percent = Math.min(100, (used / FREE_LIMIT) * 100);
  const isNearLimit = remaining <= 3 && remaining > 0;
  const isAtLimit = remaining === 0;

  const barColor = isAtLimit ? '#dc2626' : isNearLimit ? '#d97706' : '#16a34a';

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: isAtLimit ? '#fef2f2' : 'var(--bg-secondary)', border: `1px solid ${isAtLimit ? '#fecaca' : 'var(--border)'}`, borderRadius: 99 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: barColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: isAtLimit ? '#dc2626' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {isAtLimit ? 'Limit reached' : `${remaining} free left`}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${isAtLimit ? '#fecaca' : isNearLimit ? '#fde68a' : 'var(--border)'}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={barColor} strokeWidth="2" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Usage</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{used} / {FREE_LIMIT}</span>
      </div>

      <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', background: barColor, borderRadius: 99, width: `${percent}%`, transition: 'width 0.5s ease' }} />
      </div>

      {isAtLimit ? (
        <div>
          <p style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginBottom: 4 }}>
            ⚠️ Monthly limit reached — pay ₹49 per analysis
          </p>
          <p className="tamil" style={{ fontSize: 10, color: '#dc2626', opacity: 0.8 }}>
            இந்த மாதம் இலவச பகுப்பாய்வுகள் முடிந்தன · ₹49 செலுத்துங்கள்
          </p>
        </div>
      ) : isNearLimit ? (
        <p style={{ fontSize: 11, color: '#d97706' }}>
          ⚡ Only {remaining} free {remaining === 1 ? 'analysis' : 'analyses'} remaining this month
        </p>
      ) : (
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {remaining} free {remaining === 1 ? 'analysis' : 'analyses'} remaining · Resets monthly
        </p>
      )}
    </div>
  );
}
