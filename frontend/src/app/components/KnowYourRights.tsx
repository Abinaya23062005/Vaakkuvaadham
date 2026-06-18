'use client';

import { useState } from 'react';

interface RightsSection {
  id: string;
  icon: string;
  title: string;
  title_tamil: string;
  law: string;
  color: string;
  rights: { en: string; ta: string }[];
  warnings: { en: string; ta: string }[];
}

const RIGHTS_DATA: RightsSection[] = [
  {
    id: 'tenant',
    icon: '🏠',
    title: 'Tenant Rights',
    title_tamil: 'குத்தகைதாரர் உரிமைகள்',
    law: 'Tamil Nadu Rent Control Act & Transfer of Property Act',
    color: '#2563eb',
    rights: [
      { en: 'You have the right to peaceful enjoyment of the rented property without interference from the landlord.', ta: 'வீட்டு உரிமையாளரின் தலையீடு இல்லாமல் வாடகை சொத்தை அமைதியாக அனுபவிக்கும் உரிமை உங்களுக்கு உண்டு.' },
      { en: 'The landlord must give at least 24 hours notice before entering the premises (except emergencies).', ta: 'அவசரகால சூழ்நிலைகளை தவிர, உள்ளே நுழைவதற்கு முன் வீட்டு உரிமையாளர் குறைந்தது 24 மணி நேர முன்னறிவிப்பு கொடுக்க வேண்டும்.' },
      { en: 'Security deposit must be refunded within 30 days of vacating, with written deductions provided.', ta: 'காலி செய்த 30 நாட்களுக்குள் பாதுகாப்பு வைப்புத் தொகை திரும்பிக் கொடுக்கப்பட வேண்டும்.' },
      { en: 'Landlord cannot cut off electricity or water supply to force you to vacate illegally.', ta: 'உங்களை வலுக்கட்டாயமாக காலி செய்ய வீட்டு உரிமையாளர் மின்சாரம் அல்லது தண்ணீரை துண்டிக்க முடியாது.' },
      { en: 'Rent can only be increased as per the terms in the agreement or Tamil Nadu Rent Control Act limits.', ta: 'ஒப்பந்தத்தின் விதிமுறைகளின்படி மட்டுமே வாடகை உயர்த்தப்படலாம்.' },
      { en: 'You are entitled to a proper receipt for every rent payment made.', ta: 'ஒவ்வொரு வாடகை கட்டணத்திற்கும் சரியான ரசீது பெறுவதற்கு நீங்கள் உரிமை பெற்றவர்.' },
    ],
    warnings: [
      { en: 'Always register your rental agreement at the Sub-Registrar office for agreements over 11 months.', ta: '11 மாதங்களுக்கு மேல் உள்ள ஒப்பந்தங்களை Sub-Registrar அலுவலகத்தில் பதிவு செய்யுங்கள்.' },
      { en: 'Keep all rent receipts as proof of payment to protect against false eviction claims.', ta: 'போலி வெளியேற்ற உரிமைகோரல்களுக்கு எதிராக பாதுகாப்பாக அனைத்து ரசீதுகளையும் வைத்திருங்கள்.' },
    ],
  },
  {
    id: 'employee',
    icon: '💼',
    title: 'Employee Rights',
    title_tamil: 'பணியாளர் உரிமைகள்',
    law: 'Industrial Disputes Act, Payment of Wages Act & Shops and Establishments Act',
    color: '#16a34a',
    rights: [
      { en: 'You are entitled to a written appointment letter detailing salary, designation, and terms.', ta: 'சம்பளம், பதவி மற்றும் விதிமுறைகளை விவரிக்கும் எழுத்துப்பூர்வ நியமன கடிதம் பெறுவதற்கு நீங்கள் உரிமை பெற்றவர்.' },
      { en: 'Salary must be paid on time — failure to pay is a punishable offense under Payment of Wages Act.', ta: 'சம்பளம் சரியான நேரத்தில் கொடுக்கப்பட வேண்டும் — தாமதமாக கொடுப்பது சட்டப்படி தண்டனைக்குரிய குற்றம்.' },
      { en: 'Employer must contribute to Provident Fund (PF) if your monthly salary is below ₹15,000.', ta: 'மாத சம்பளம் ₹15,000க்கு கீழே இருந்தால் முதலாளி PF பங்களிக்க வேண்டும்.' },
      { en: 'Notice period must be equal for both employer and employee — one-sided notice is unfair.', ta: 'முன்னறிவிப்பு காலம் முதலாளி மற்றும் பணியாளர் இருவருக்கும் சமமமாக இருக்க வேண்டும்.' },
      { en: 'Non-compete clauses cannot restrict you from working in your field for more than 1 year typically.', ta: 'போட்டியாளர் தடை விதிகள் பொதுவாக 1 வருடத்திற்கு மேல் உங்கள் வேலையை தடுக்க முடியாது.' },
      { en: 'Female employees are entitled to maternity leave of 26 weeks under Maternity Benefit Act.', ta: 'பெண் பணியாளர்கள் மகப்பேறு சட்டத்தின்படி 26 வாரங்கள் மகப்பேறு விடுப்பு பெற உரிமை உண்டு.' },
    ],
    warnings: [
      { en: 'Never sign a blank document or agree to verbal terms only — get everything in writing.', ta: 'ஒருபோதும் வெற்று ஆவணத்தில் கையெழுத்திட வேண்டாம் — எல்லாவற்றையும் எழுத்துப்பூர்வமாக பெறுங்கள்.' },
      { en: 'Broad non-compete clauses restricting entire industry are generally unenforceable in Indian courts.', ta: 'முழு தொழில் துறையையும் தடுக்கும் பரந்த போட்டியாளர் தடை விதிகள் இந்திய நீதிமன்றங்களில் பொதுவாக செல்லுபடியாகாது.' },
    ],
  },
  {
    id: 'court',
    icon: '⚖️',
    title: 'Court Notice Rights',
    title_tamil: 'நீதிமன்ற அறிவிப்பு உரிமைகள்',
    law: 'Code of Civil Procedure & Criminal Procedure Code',
    color: '#7c3aed',
    rights: [
      { en: 'You have the right to respond to any court notice — silence or ignoring it can go against you.', ta: 'எந்த நீதிமன்ற அறிவிப்பிற்கும் பதில் அளிக்கும் உரிமை உங்களுக்கு உண்டு — மௌனம் உங்களுக்கு எதிராக போகலாம்.' },
      { en: 'You are entitled to legal representation — if you cannot afford a lawyer, Legal Aid is available free.', ta: 'சட்ட உதவி பெறுவதற்கு நீங்கள் உரிமை பெற்றவர் — வழக்கறிஞரை வாடகைக்கு எடுக்க முடியாவிட்டால் Legal Aid கிடைக்கும்.' },
      { en: 'The notice must clearly state the nature of the claim, court details, and date of hearing.', ta: 'அறிவிப்பு உரிமைகோரலின் தன்மை, நீதிமன்ற விவரங்கள் மற்றும் விசாரணை தேதியை தெளிவாக கூற வேண்டும்.' },
      { en: 'You have the right to request an adjournment (postponement) if you need more time to prepare.', ta: 'தயாரிக்க அதிக நேரம் தேவைப்பட்டால் ஒத்திவைப்பு கோர உங்களுக்கு உரிமை உண்டு.' },
      { en: 'Civil court notices are not arrest warrants — you cannot be arrested just for receiving a civil notice.', ta: 'சிவில் நீதிமன்ற அறிவிப்புகள் கைது வாரண்டுகள் அல்ல — சிவில் அறிவிப்பு பெற்றதற்காக கைது செய்யப்பட மாட்டீர்கள்.' },
    ],
    warnings: [
      { en: 'Never ignore a court notice — respond within the given time even if just to request more time.', ta: 'நீதிமன்ற அறிவிப்பை ஒருபோதும் புறக்கணிக்க வேண்டாம் — கொடுக்கப்பட்ட நேரத்திற்குள் பதில் அளியுங்கள்.' },
      { en: 'Free legal aid is available at Tamil Nadu State Legal Services Authority — call 1800-103-1800.', ta: 'இலவச சட்ட உதவி தமிழ்நாடு அரசு சட்ட சேவை ஆணையத்தில் கிடைக்கும் — 1800-103-1800 அழைக்கவும்.' },
    ],
  },
  {
    id: 'consumer',
    icon: '🛍️',
    title: 'Consumer Rights',
    title_tamil: 'நுகர்வோர் உரிமைகள்',
    law: 'Consumer Protection Act 2019',
    color: '#d97706',
    rights: [
      { en: 'You have the right to file a complaint for defective goods or deficient services within 2 years.', ta: 'குறைபாடுள்ள பொருட்கள் அல்லது சேவைகளுக்கு 2 வருடங்களுக்குள் புகார் தாக்கல் செய்யும் உரிமை உண்டு.' },
      { en: 'You can file complaints online at edaakhil.nic.in without visiting the consumer court.', ta: 'நுகர்வோர் நீதிமன்றத்திற்கு செல்லாமல் edaakhil.nic.in இல் ஆன்லைனில் புகார் தாக்கல் செய்யலாம்.' },
      { en: 'Complaints up to ₹50 lakhs go to District Consumer Commission — filing fee is only ₹200.', ta: '₹50 லட்சம் வரையிலான புகார்கள் மாவட்ட நுகர்வோர் ஆணையத்திற்கு செல்லும் — தாக்கல் கட்டணம் ₹200 மட்டுமே.' },
      { en: 'E-commerce companies are also liable under Consumer Protection Act for faulty products.', ta: 'குறைபாடுள்ள தயாரிப்புகளுக்கு இ-காமர்ஸ் நிறுவனங்களும் நுகர்வோர் பாதுகாப்பு சட்டத்தின் கீழ் பொறுப்பாளிகள்.' },
    ],
    warnings: [
      { en: 'Always keep bills, receipts, and warranty cards — they are essential evidence for consumer complaints.', ta: 'எப்போதும் பில்கள், ரசீதுகள் மற்றும் உத்தரவாத அட்டைகளை வைத்திருங்கள் — அவை நுகர்வோர் புகார்களுக்கு அத்தியாவசிய ஆதாரங்கள்.' },
    ],
  },
];

interface KnowYourRightsProps {
  showTamil: boolean;
}

export default function KnowYourRights({ showTamil }: KnowYourRightsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [openRight, setOpenRight] = useState<string | null>(null);

  const active = RIGHTS_DATA.find(r => r.id === activeSection);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          Know Your Legal Rights in India
        </p>
        {showTamil && (
          <p className="tamil" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            இந்தியாவில் உங்கள் சட்ட உரிமைகளை அறிந்துகொள்ளுங்கள்
          </p>
        )}
      </div>

      {/* Category selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {RIGHTS_DATA.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            style={{
              padding: '14px 16px', borderRadius: 12, border: `2px solid ${activeSection === section.id ? section.color : 'var(--border)'}`,
              background: activeSection === section.id ? section.color + '10' : 'var(--bg-secondary)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{section.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeSection === section.id ? section.color : 'var(--text-primary)', marginBottom: 2 }}>
              {showTamil ? section.title_tamil : section.title}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{section.law}</div>
          </button>
        ))}
      </div>

      {/* Rights content */}
      {active && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{
            background: active.color + '08', border: `1px solid ${active.color}25`,
            borderRadius: 14, padding: 20, marginBottom: 12,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: active.color, marginBottom: 12 }}>
              ✅ Your Rights — {showTamil ? active.title_tamil : active.title}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active.rights.map((right, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  background: 'var(--bg-card)', borderRadius: 8,
                  border: '1px solid var(--border)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                  onClick={() => setOpenRight(openRight === `${active.id}-${i}` ? null : `${active.id}-${i}`)}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: active.color,
                    color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {right.en}
                    </p>
                    {showTamil && openRight === `${active.id}-${i}` && (
                      <p className="tamil" style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                        {right.ta}
                      </p>
                    )}
                  </div>
                  {showTamil && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"
                      style={{ flexShrink: 0, marginTop: 4, transform: openRight === `${active.id}-${i}` ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', marginBottom: 8 }}>
              ⚠️ Important — Things to Remember
            </p>
            {active.warnings.map((w, i) => (
              <div key={i} style={{ marginBottom: i < active.warnings.length - 1 ? 8 : 0 }}>
                <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>{w.en}</p>
                {showTamil && <p className="tamil" style={{ fontSize: 11, color: '#b45309', lineHeight: 1.7, marginTop: 2 }}>{w.ta}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
        For free legal aid in Tamil Nadu: <strong>1800-103-1800</strong> (National Legal Services Authority)
      </p>
    </div>
  );
}
