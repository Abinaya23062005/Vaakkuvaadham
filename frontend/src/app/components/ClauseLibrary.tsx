'use client';

import { useState, useMemo } from 'react';

interface ClauseEntry {
  id: string;
  name: string;
  name_tamil: string;
  category: string;
  riskLevel: 'high' | 'medium' | 'low' | 'standard';
  meaning: string;
  meaning_tamil: string;
  whatToDo: string;
  whatToDo_tamil: string;
  foundIn: string[];
}

const CLAUSES: ClauseEntry[] = [
  {
    id: '1', name: 'Arbitrary Entry Clause', name_tamil: 'தன்னிச்சையான நுழைவு விதி',
    category: 'Rental', riskLevel: 'high',
    meaning: 'Allows the landlord to enter the rented property at any time without prior notice.',
    meaning_tamil: 'வீட்டு உரிமையாளர் எந்த முன் அறிவிப்பும் இல்லாமல் எந்த நேரத்திலும் வாடகை சொத்தினுள் நுழைய அனுமதிக்கிறது.',
    whatToDo: 'Ask to modify to "24 hours written notice required except in emergencies."',
    whatToDo_tamil: '"அவசரகாலத்தைத் தவிர 24 மணி நேர முன்னறிவிப்பு தேவை" என மாற்றுங்கள்.',
    foundIn: ['Rental Agreement'],
  },
  {
    id: '2', name: 'Unilateral Termination Clause', name_tamil: 'ஒருதலைப்பட்ச ரத்து விதி',
    category: 'General', riskLevel: 'high',
    meaning: 'Only one party (usually the stronger party) has the right to terminate the agreement, while the other does not.',
    meaning_tamil: 'ஒரு தரப்பு மட்டுமே (பொதுவாக வலிமையான தரப்பு) ஒப்பந்தத்தை ரத்து செய்ய உரிமை பெறுகிறது.',
    whatToDo: 'Request that termination rights be equal for both parties with the same notice period.',
    whatToDo_tamil: 'இரு தரப்பிற்கும் சம முன்னறிவிப்புடன் சம ரத்து உரிமைகளை கோருங்கள்.',
    foundIn: ['Rental Agreement', 'Job Offer', 'Service Contract'],
  },
  {
    id: '3', name: 'Security Deposit Forfeiture Clause', name_tamil: 'பாதுகாப்பு வைப்பு முறிவு விதி',
    category: 'Rental', riskLevel: 'high',
    meaning: 'Allows the landlord to deduct any amount from the security deposit without providing proof or receipts for the alleged damages.',
    meaning_tamil: 'வீட்டு உரிமையாளர் சேதத்திற்கான ஆதாரம் இல்லாமல் பாதுகாப்பு வைப்பிலிருந்து எந்த தொகையையும் கழிக்க அனுமதிக்கிறது.',
    whatToDo: 'Insist on "deductions only with written proof/receipts provided within 7 days of vacating."',
    whatToDo_tamil: '"காலி செய்த 7 நாட்களுக்குள் எழுத்துப்பூர்வ ஆதாரத்துடன் மட்டுமே கழிக்கலாம்" என வலியுறுத்துங்கள்.',
    foundIn: ['Rental Agreement'],
  },
  {
    id: '4', name: 'Non-Compete Clause', name_tamil: 'போட்டியாளர் தடை விதி',
    category: 'Employment', riskLevel: 'high',
    meaning: 'Prevents you from working for competitors or starting a similar business for a specified period after leaving.',
    meaning_tamil: 'நீங்கள் வெளியேறிய பிறகு குறிப்பிட்ட காலத்திற்கு போட்டியாளர்களிடம் பணி செய்வதை அல்லது இதே தொழிலில் ஈடுபடுவதை தடுக்கிறது.',
    whatToDo: 'Negotiate to limit scope (specific clients/projects only) and duration (max 6 months, not 1-2 years).',
    whatToDo_tamil: 'நோக்கத்தை (குறிப்பிட்ட வாடிக்கையாளர்கள் மட்டும்) மற்றும் காலத்தை (அதிகபட்சம் 6 மாதங்கள்) கட்டுப்படுத்த பேச்சுவார்த்தை நடத்துங்கள்.',
    foundIn: ['Job Offer', 'Employment Contract'],
  },
  {
    id: '5', name: 'Automatic Renewal Clause', name_tamil: 'தானியங்கி புதுப்பிப்பு விதி',
    category: 'General', riskLevel: 'medium',
    meaning: 'The agreement automatically renews unless you give notice to terminate before a specific deadline, often 30-60 days before expiry.',
    meaning_tamil: 'குறிப்பிட்ட காலக்கெடுவிற்கு முன்பு நீங்கள் அறிவிக்காவிட்டால் ஒப்பந்தம் தானாகவே புதுப்பிக்கப்படுகிறது.',
    whatToDo: 'Note the renewal deadline in your calendar. Request that the renewal requires explicit written consent.',
    whatToDo_tamil: 'புதுப்பிப்பு காலக்கெடுவை உங்கள் நாட்காட்டியில் குறிக்கவும். தெளிவான எழுத்துப்பூர்வ ஒப்புதல் தேவை என கோருங்கள்.',
    foundIn: ['Rental Agreement', 'Service Contract', 'Software License'],
  },
  {
    id: '6', name: 'Indemnification Clause', name_tamil: 'இழப்பீடு விதி',
    category: 'General', riskLevel: 'medium',
    meaning: 'Requires you to compensate the other party for any losses, damages, or legal fees they incur, even if you were not at fault.',
    meaning_tamil: 'உங்கள் தவறு இல்லாவிட்டாலும், மற்ற தரப்பிற்கு ஏற்படும் இழப்புகள், சேதங்கள் அல்லது சட்ட கட்டணங்களை நீங்கள் ஈடு செய்ய வேண்டும்.',
    whatToDo: 'Add "only for damages directly caused by proven negligence or willful misconduct of [your name]."',
    whatToDo_tamil: '"நிரூபிக்கப்பட்ட அலட்சியம் அல்லது வேண்டுமென்றே செய்த தவறால் மட்டுமே" என சேர்க்கவும்.',
    foundIn: ['Service Contract', 'Vendor Agreement', 'Freelance Contract'],
  },
  {
    id: '7', name: 'Limitation of Liability Clause', name_tamil: 'பொறுப்பு வரம்பு விதி',
    category: 'General', riskLevel: 'medium',
    meaning: 'Caps the maximum amount the other party owes you in case of breach or damage, often limiting it to the contract value.',
    meaning_tamil: 'மீறல் அல்லது சேதம் ஏற்பட்டால் மற்ற தரப்பு உங்களுக்கு செலுத்தக்கூடிய அதிகபட்ச தொகையை கட்டுப்படுத்துகிறது.',
    whatToDo: 'Ensure the cap is reasonable and excludes gross negligence, fraud, and willful misconduct.',
    whatToDo_tamil: 'வரம்பு நியாயமானதாக இருப்பதை உறுதிசெய்யுங்கள், கடுமையான அலட்சியம் மற்றும் மோசடியை விலக்குங்கள்.',
    foundIn: ['Service Contract', 'Software Agreement'],
  },
  {
    id: '8', name: 'Force Majeure Clause', name_tamil: 'இயலாமை விதி',
    category: 'General', riskLevel: 'low',
    meaning: 'Excuses a party from performing their obligations due to extraordinary events beyond their control — floods, wars, pandemics.',
    meaning_tamil: 'வெள்ளம், யுத்தம், தொற்றுநோய் போன்ற அசாதாரண சூழ்நிலைகளில் தங்கள் கடமைகளை நிறைவேற்றாததற்கு ஒரு தரப்பை மன்னிக்கிறது.',
    whatToDo: 'This is generally standard and acceptable. Ensure the definition of force majeure events is specific, not vague.',
    whatToDo_tamil: 'இது பொதுவாக நியாயமான விதி. இயலாமை நிகழ்வுகளின் வரையறை தெளிவாக இருக்கிறதா என சரிபாருங்கள்.',
    foundIn: ['All contracts'],
  },
  {
    id: '9', name: 'Arbitration Clause', name_tamil: 'நடுவர் விதி',
    category: 'Dispute', riskLevel: 'low',
    meaning: 'Requires disputes to be resolved through arbitration rather than court, which can be faster but sometimes favors the stronger party.',
    meaning_tamil: 'நீதிமன்றத்திற்கு பதிலாக நடுவர் மூலம் தகராறுகளை தீர்க்க வேண்டும் என்று தேவைப்படுகிறது.',
    whatToDo: 'Acceptable if arbitrator selection process is fair. Ensure location is in your city, not the other party\'s city.',
    whatToDo_tamil: 'நடுவர் தேர்வு செயல்முறை நியாயமானது என்றால் ஏற்றுக்கொள்ளலாம். இடம் உங்கள் நகரில் இருக்க வேண்டும்.',
    foundIn: ['All contracts'],
  },
  {
    id: '10', name: 'Probation Clause', name_tamil: 'பரீட்சை காலம் விதி',
    category: 'Employment', riskLevel: 'low',
    meaning: 'A trial period (usually 3-6 months) during which either party can terminate without the full notice period.',
    meaning_tamil: 'பரீட்சை காலம் (பொதுவாக 3-6 மாதங்கள்) — இந்த காலத்தில் முழு முன்னறிவிப்பு காலம் இல்லாமல் ஒப்பந்தத்தை ரத்து செய்யலாம்.',
    whatToDo: 'Standard clause. Ensure probation period is not more than 6 months and that salary/benefits apply from day 1.',
    whatToDo_tamil: 'நியாயமான விதி. பரீட்சை காலம் 6 மாதங்களுக்கு மிகாமல் இருக்கட்டும், முதல் நாளிலிருந்தே சம்பளம் கிடைக்கட்டும்.',
    foundIn: ['Job Offer', 'Employment Contract'],
  },
];

const RISK_CONFIG = {
  high: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'High Risk' },
  medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Medium Risk' },
  low: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Low Risk' },
  standard: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Standard' },
};

interface ClauseLibraryProps {
  showTamil: boolean;
  searchTerm?: string;
}

export default function ClauseLibrary({ showTamil, searchTerm: externalSearch }: ClauseLibraryProps) {
  const [search, setSearch] = useState(externalSearch || '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [openClause, setOpenClause] = useState<string | null>(null);

  const categories = ['All', 'Rental', 'Employment', 'General', 'Dispute'];

  const filtered = useMemo(() => {
    return CLAUSES.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.meaning.toLowerCase().includes(search.toLowerCase()) ||
        c.name_tamil.includes(search);
      const matchCat = filterCategory === 'All' || c.category === filterCategory;
      const matchRisk = filterRisk === 'All' || c.riskLevel === filterRisk.toLowerCase();
      return matchSearch && matchCat && matchRisk;
    });
  }, [search, filterCategory, filterRisk]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Legal Clause Library
        </p>
        {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>சட்ட விதி நூலகம் — பொதுவான சட்ட விதிகளை புரிந்துகொள்ளுங்கள்</p>}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clauses... e.g. non-compete, security deposit"
            style={{
              width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '9px 12px 9px 34px', fontSize: 13,
              color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 11,
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-secondary)',
              color: filterCategory === cat ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${filterCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
            }}>
              {cat}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 2px' }} />
          {['All', 'High', 'Medium', 'Low', 'Standard'].map(r => (
            <button key={r} onClick={() => setFilterRisk(r)} style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 11,
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: filterRisk === r ? 'var(--bg-tertiary)' : 'transparent',
              color: filterRisk === r ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${filterRisk === r ? 'var(--border-strong)' : 'transparent'}`,
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        Showing {filtered.length} of {CLAUSES.length} clauses
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(clause => {
          const rc = RISK_CONFIG[clause.riskLevel];
          const isOpen = openClause === clause.id;
          return (
            <div key={clause.id} style={{
              border: `1px solid ${isOpen ? rc.color + '50' : 'var(--border)'}`,
              borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s',
              background: 'var(--bg-secondary)',
            }}>
              <button
                onClick={() => setOpenClause(isOpen ? null : clause.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                  background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {rc.label}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 1 }}>{clause.name}</p>
                  {showTamil && <p className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{clause.name_tamil}</p>}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {clause.foundIn.slice(0, 2).map(f => (
                    <span key={f} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}>{f}</span>
                  ))}
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>What it means</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{clause.meaning}</p>
                    {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, marginTop: 5 }}>{clause.meaning_tamil}</p>}
                  </div>
                  <div style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 8, padding: '10px 12px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: rc.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>What to do</p>
                    <p style={{ fontSize: 13, color: rc.color, lineHeight: 1.6 }}>{clause.whatToDo}</p>
                    {showTamil && <p className="tamil" style={{ fontSize: 12, color: rc.color, lineHeight: 1.8, marginTop: 4, opacity: 0.85 }}>{clause.whatToDo_tamil}</p>}
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
