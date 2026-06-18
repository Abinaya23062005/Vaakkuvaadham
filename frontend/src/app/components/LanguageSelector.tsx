'use client';

export const SUPPORTED_LANGUAGES = [
  { code: 'tamil',     label: 'தமிழ்',     english: 'Tamil',     region: 'Tamil Nadu',        color: '#e85d26' },
  { code: 'english',   label: 'English',    english: 'English',   region: 'All India',          color: '#2563eb' },
  { code: 'telugu',    label: 'తెలుగు',    english: 'Telugu',    region: 'Andhra / Telangana', color: '#16a34a' },
  { code: 'kannada',   label: 'ಕನ್ನಡ',    english: 'Kannada',   region: 'Karnataka',          color: '#d97706' },
  { code: 'malayalam', label: 'മലയാളം',   english: 'Malayalam', region: 'Kerala',             color: '#7c3aed' },
  { code: 'hindi',     label: 'हिन्दी',    english: 'Hindi',     region: 'North India',        color: '#0891b2' },
];

interface LanguageSelectorProps {
  selected: string;
  onChange: (lang: string) => void;
  compact?: boolean;
}

export default function LanguageSelector({ selected, onChange, compact }: LanguageSelectorProps) {
  if (compact) {
    return (
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 10px', fontSize: 13,
          color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
        }}
      >
        {SUPPORTED_LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.english}</option>
        ))}
      </select>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Summary Output Language
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
          — choose which language to receive the AI summary in
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {SUPPORTED_LANGUAGES.map(lang => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onChange(lang.code)}
              style={{
                padding: '14px 12px', borderRadius: 12, border: `2px solid ${isSelected ? lang.color : 'var(--border)'}`,
                background: isSelected ? `${lang.color}12` : 'var(--bg-secondary)',
                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 4px 12px ${lang.color}25` : 'none',
              }}
            >
              <div style={{
                fontSize: 20, fontWeight: 700, marginBottom: 4,
                color: isSelected ? lang.color : 'var(--text-primary)',
                fontFamily: "'Noto Sans Tamil', sans-serif",
              }}>
                {lang.label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? lang.color : 'var(--text-secondary)' }}>
                {lang.english}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {lang.region}
              </div>
              {isSelected && (
                <div style={{
                  marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: lang.color, color: 'white', borderRadius: 99,
                  padding: '2px 8px', fontSize: 10, fontWeight: 700,
                }}>
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
        The AI will generate the document summary and key points in your chosen language
      </p>
    </div>
  );
}
