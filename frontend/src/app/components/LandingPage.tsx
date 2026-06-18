'use client';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isDark: boolean;
}

const TESTIMONIALS = [
  { name: 'Priya Devi', role: 'Tenant, Chennai', avatar: 'P', color: '#e85d26', text: 'My landlord had a clause allowing him to enter anytime. NyayaAI caught it and gave me the exact words to negotiate. Saved my ₹45,000 deposit!', text_tamil: 'NyayaAI என் வாடகை ஒப்பந்தத்தில் ஆபத்தான விதிகளை கண்டுபிடித்தது. என் ₹45,000 வைப்பு தொகை பாதுகாக்கப்பட்டது!' },
  { name: 'Karthik S', role: 'Software Engineer, Coimbatore', avatar: 'K', color: '#2563eb', text: 'My job offer had a 2-year non-compete clause. NyayaAI explained it clearly in Tamil and helped me negotiate it down to 6 months.', text_tamil: 'என் வேலை வாய்ப்பு கடிதத்தில் 2 வருட போட்டியாளர் தடை விதி இருந்தது. NyayaAI தமிழில் விளக்கி பேச்சுவார்த்தைக்கு உதவியது.' },
  { name: 'Meenakshi R', role: 'Teacher, Madurai', avatar: 'M', color: '#7c3aed', text: 'I received a court notice and panicked. NyayaAI explained exactly what it meant and what I needed to do. The Tamil translation was perfect.', text_tamil: 'நீதிமன்ற அறிவிப்பு கண்டு பயந்தேன். NyayaAI தமிழில் என்ன செய்ய வேண்டும் என்று தெளிவாக விளக்கியது.' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📄', title: 'Upload Document', title_tamil: 'ஆவணத்தை பதிவேற்றுங்கள்', desc: 'PDF, photo, or paste text. Rental agreements, job offers, court notices.', desc_tamil: 'PDF, புகைப்படம், அல்லது உரை ஒட்டுங்கள்.' },
  { step: '02', icon: '🤖', title: 'AI Reads Everything', title_tamil: 'AI அனைத்தையும் படிக்கிறது', desc: 'Groq AI reads every clause under Indian law context in seconds.', desc_tamil: 'Groq AI இந்திய சட்ட சூழலில் ஒவ்வொரு விதியையும் படிக்கிறது.' },
  { step: '03', icon: '🚩', title: 'Red Flags Detected', title_tamil: 'ஆபத்துகள் கண்டறியப்படுகின்றன', desc: 'Unfair, one-sided, or risky clauses highlighted with severity.', desc_tamil: 'நியாயமற்ற, ஒருதலைப்பட்ச விதிகள் தீவிரத்துடன் குறிக்கப்படுகின்றன.' },
  { step: '04', icon: '🗣️', title: 'Tamil Summary', title_tamil: 'தமிழ் சுருக்கம்', desc: 'Full analysis in natural Tamil — not formal or archaic.', desc_tamil: 'இயல்பான தமிழில் முழு பகுப்பாய்வு — சட்ட தமிழ் அல்ல.' },
];

const FEATURES = [
  '📄 PDF Upload & Analysis', '📸 Camera / Image OCR', '🚩 Red Flag Detection',
  '🗣️ Tamil & 5 Languages', '💬 Ask AI About Document', '🤝 Negotiation Coach',
  '🔄 Compare Documents', '📋 Generate Fair Documents', '✅ Before You Sign Checklist',
  '📊 Risk Score Card', '📤 Download PDF Report', '💚 WhatsApp Share',
  '🎤 Voice Input in Tamil', '🔊 Voice Summary Playback', '📅 Contract Reminders',
  '⚖️ Know Your Rights', '📚 Legal Clause Library',
];

export default function LandingPage({ onGetStarted, onLogin, isDark }: LandingPageProps) {
  const btnHover = (e: React.MouseEvent, enter: boolean) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = enter ? 'translateY(-2px)' : '';
    el.style.boxShadow = enter ? '0 12px 32px rgba(232,93,38,0.45)' : '0 8px 24px rgba(232,93,38,0.35)';
  };

  return (
    <div style={{ overflowX: 'hidden' }}>

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', background: isDark ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,93,38,0.18) 0%, transparent 65%), var(--bg-tertiary)' : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,93,38,0.07) 0%, transparent 65%), var(--bg-tertiary)', padding: '80px 20px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 99, padding: '7px 18px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite' }} />
            10,000+ documents analyzed · Completely Free
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.04em' }}>
            Legal Clarity for<br />
            <span style={{ color: 'var(--primary)' }}>Every Indian</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 12px', lineHeight: 1.65 }}>
            Upload any Indian legal document and get a plain-language analysis in seconds — in Tamil, Telugu, Kannada, Malayalam, Hindi or English.
          </p>
          <p className="tamil" style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 36 }}>
            சட்ட ஆவணங்களை தமிழில் புரிந்துகொள்ளுங்கள் — இலவசமாக
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button onClick={onGetStarted} onMouseEnter={e => btnHover(e, true)} onMouseLeave={e => btnHover(e, false)}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(232,93,38,0.35)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Analyze My Document — Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button onClick={onLogin}
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}>
              Sign In
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {['P','K','M','R','S'].map((l,i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', marginLeft: i > 0 ? -10 : 0, background: ['#e85d26','#2563eb','#16a34a','#7c3aed','#d97706'][i], border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Trusted by 10,000+ Indians</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '36px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[{ v: '10,000+', l: 'Documents Analyzed', lt: 'ஆவணங்கள்' }, { v: '₹2.4 Cr', l: 'Saved by Users', lt: 'சேமிக்கப்பட்டது' }, { v: '6', l: 'Indian Languages', lt: 'மொழிகள்' }, { v: 'Free', l: 'Forever Plan', lt: 'எப்போதும் இலவசம்' }].map(s => (
            <div key={s.v} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.l}</div>
              <div className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.lt}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 20px', background: 'var(--bg-tertiary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10 }}>From upload to understanding<br />in under 15 seconds</h2>
            <p className="tamil" style={{ fontSize: 14, color: 'var(--text-muted)' }}>15 விநாடிகளில் உங்கள் ஆவணத்தை புரிந்துகொள்ளுங்கள்</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 20px', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: 'rgba(232,93,38,0.1)', border: '1px solid rgba(232,93,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', marginBottom: 4, letterSpacing: '0.06em' }}>STEP {step.step}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{step.title}</div>
                    <div className="tamil" style={{ fontSize: 11, color: 'var(--primary)', marginBottom: 5 }}>{step.title_tamil}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Real Stories</p>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>People who protected themselves</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 20px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>{[1,2,3,4,5].map(j => <span key={j} style={{ color: '#f59e0b', fontSize: 13 }}>★</span>)}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12, fontStyle: 'italic' }}>"{t.text}"</p>
                <p className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 14 }}>"{t.text_tamil}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 20px', background: 'var(--bg-tertiary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Everything you need to stay protected</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>17 features — all free — no credit card required</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px' }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{f.slice(0, 2)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{f.slice(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 20px', background: isDark ? 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(232,93,38,0.15) 0%, transparent 70%), var(--bg-card)' : 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(232,93,38,0.05) 0%, transparent 70%), var(--bg-card)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 14 }}>
            Don't sign anything without<br /><span style={{ color: 'var(--primary)' }}>understanding it first</span>
          </h2>
          <p className="tamil" style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>புரிந்துகொள்ளாமல் எந்த ஆவணத்திலும் கையெழுத்திட வேண்டாம்</p>
          <button onClick={onGetStarted} onMouseEnter={e => btnHover(e, true)} onMouseLeave={e => btnHover(e, false)}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 28px rgba(232,93,38,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start Analyzing — It's Free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>No credit card · No registration required · Free forever</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '24px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M8 7H3l3 6-3 6h5M16 7h5l-3 6 3 6h-5M8 7h8"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>Nyaya<span style={{ color: 'var(--primary)' }}>AI</span></div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Legal Clarity for Every Indian</div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>General guidance only · Consult a licensed lawyer · © 2025 NyayaAI</p>
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
