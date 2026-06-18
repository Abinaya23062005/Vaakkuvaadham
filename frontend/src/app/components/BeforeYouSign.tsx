'use client';

import { useState } from 'react';
import type { Analysis } from '../lib/api';

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  task_tamil: string;
  priority: 'must' | 'should' | 'optional';
  done: boolean;
}

interface BeforeYouSignProps {
  analysis: Analysis;
  showTamil: boolean;
}

const PRIORITY_CONFIG = {
  must: { label: 'Must Do', label_tamil: 'கட்டாயம்', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  should: { label: 'Should Do', label_tamil: 'செய்யுங்கள்', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  optional: { label: 'Optional', label_tamil: 'விருப்பம்', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

const generateChecklist = (analysis: Analysis): ChecklistItem[] => {
  const items: ChecklistItem[] = [
    { id: 'u1', category: 'Verify', task: "Read the entire document carefully — don't skip any section", task_tamil: 'முழு ஆவணத்தையும் கவனமாக படியுங்கள் — எந்த பகுதியையும் தவிர்க்காதீர்கள்', priority: 'must', done: false },
    { id: 'u2', category: 'Verify', task: 'Confirm all personal details (name, address, date) are correct', task_tamil: 'அனைத்து தனிப்பட்ட விவரங்களும் சரியாக உள்ளதா என சரிபாருங்கள்', priority: 'must', done: false },
    { id: 'u3', category: 'Legal', task: 'Ensure the document is on proper stamp paper of correct value', task_tamil: 'சரியான மதிப்பு கொண்ட ஸ்டாம்ப் பேப்பரில் ஆவணம் உள்ளதா என சரிபாருங்கள்', priority: 'must', done: false },
    { id: 'u4', category: 'Legal', task: 'Get a signed copy of the document for your own records', task_tamil: 'உங்கள் பதிவுகளுக்காக கையெழுத்திட்ட ஆவணத்தின் நகலை வாங்குங்கள்', priority: 'must', done: false },
    { id: 'u5', category: 'Negotiate', task: 'Address all red flags identified by NyayaAI before signing', task_tamil: 'கையெழுத்திடுவதற்கு முன் NyayaAI கண்டறிந்த அனைத்து ஆபத்தான விதிகளையும் தீர்க்கவும்', priority: 'must', done: false },
  ];

  // Add red flag items
  (analysis.redFlags || []).filter(f => f.risk === 'high').forEach((flag, i) => {
    items.push({
      id: `rf${i}`, category: 'Red Flag',
      task: `Resolve: "${flag.clause}" — ${flag.explanation.slice(0, 80)}...`,
      task_tamil: (flag.explanation_tamil || flag.explanation).slice(0, 80) + '...',
      priority: 'must', done: false,
    });
  });

  const type = analysis.documentType;

  if (type === 'rental_agreement') {
    items.push(
      { id: 'r1', category: 'Property', task: 'Visit and inspect the property in person before signing', task_tamil: 'கையெழுத்திடுவதற்கு முன் சொத்தை நேரில் பார்வையிடுங்கள்', priority: 'must', done: false },
      { id: 'r2', category: 'Property', task: 'Take photos/video of property condition to document existing damage', task_tamil: 'ஏற்கனவே உள்ள சேதங்களை ஆவணப்படுத்த சொத்தின் புகைப்படங்கள் எடுங்கள்', priority: 'must', done: false },
      { id: 'r3', category: 'Legal', task: 'Verify landlord actually owns the property — ask for ownership documents', task_tamil: 'வீட்டு உரிமையாளருக்கு சொத்து சொந்தமானதா என சரிபாருங்கள்', priority: 'must', done: false },
      { id: 'r4', category: 'Financial', task: 'Pay security deposit only via bank transfer — get receipt immediately', task_tamil: 'பாதுகாப்பு வைப்பை வங்கி பரிமாற்றம் மூலம் மட்டுமே செலுத்துங்கள்', priority: 'must', done: false },
      { id: 'r5', category: 'Legal', task: 'Register agreement at Sub-Registrar office if period exceeds 11 months', task_tamil: 'காலம் 11 மாதங்களுக்கு மேல் இருந்தால் Sub-Registrar அலுவலகத்தில் பதிவு செய்யுங்கள்', priority: 'must', done: false },
      { id: 'r6', category: 'Utilities', task: 'Confirm electricity, water, and maintenance charges are clearly stated', task_tamil: 'மின்சாரம், தண்ணீர் மற்றும் பராமரிப்பு கட்டணங்கள் தெளிவாக குறிப்பிடப்பட்டுள்ளதா', priority: 'should', done: false },
    );
  }

  if (type === 'job_offer') {
    items.push(
      { id: 'j1', category: 'Financial', task: 'Verify the CTC breakdown — understand fixed vs variable pay', task_tamil: 'CTC விவரங்களை சரிபாருங்கள் — நிலையான மற்றும் மாறும் ஊதியத்தை புரிந்துகொள்ளுங்கள்', priority: 'must', done: false },
      { id: 'j2', category: 'Legal', task: 'Check if non-compete clause is reasonable in scope and duration', task_tamil: 'போட்டியாளர் தடை விதி நோக்கம் மற்றும் காலத்தில் நியாயமானதா சரிபாருங்கள்', priority: 'must', done: false },
      { id: 'j3', category: 'Benefits', task: 'Confirm PF, ESI, gratuity, and leave entitlements are mentioned', task_tamil: 'PF, ESI, மற்றும் விடுப்பு உரிமைகள் குறிப்பிடப்பட்டுள்ளதா உறுதிசெய்யுங்கள்', priority: 'must', done: false },
      { id: 'j4', category: 'Legal', task: 'Ensure notice period is the same for both employer and employee', task_tamil: 'முன்னறிவிப்பு காலம் முதலாளி மற்றும் பணியாளர் இருவருக்கும் சமானமாக இருப்பதை உறுதிசெய்யுங்கள்', priority: 'must', done: false },
    );
  }

  if (type === 'court_notice') {
    items.push(
      { id: 'c1', category: 'Urgent', task: 'Note the response deadline — missing it can result in ex-parte judgement', task_tamil: 'பதில் அளிக்கும் கடைசி தேதியை குறிக்கவும் — தவறினால் ex-parte தீர்ப்பு வரலாம்', priority: 'must', done: false },
      { id: 'c2', category: 'Legal', task: 'Consult a lawyer immediately — free legal aid: 1800-103-1800', task_tamil: 'உடனே வழக்கறிஞரை அணுகவும் — இலவச சட்ட உதவி: 1800-103-1800', priority: 'must', done: false },
      { id: 'c3', category: 'Documents', task: 'Gather all relevant documents related to the notice subject', task_tamil: 'அறிவிப்பு தொடர்பான அனைத்து ஆவணங்களையும் சேகரியுங்கள்', priority: 'must', done: false },
    );
  }

  return items;
};

export default function BeforeYouSign({ analysis, showTamil }: BeforeYouSignProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() => generateChecklist(analysis));

  const toggle = (id: string) => setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  const reset = () => setItems(prev => prev.map(i => ({ ...i, done: false })));

  const doneCount = items.filter(i => i.done).length;
  const mustItems = items.filter(i => i.priority === 'must');
  const mustDone = mustItems.filter(i => i.done).length;
  const allMustDone = mustDone === mustItems.length;
  const progress = Math.round((doneCount / items.length) * 100);

  const printChecklist = () => {
    const html = `<html><head><title>NyayaAI — Before You Sign Checklist</title>
    <style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#1a1714}h1{color:#e85d26;font-size:22px;margin-bottom:4px}.sub{color:#666;font-size:13px;margin-bottom:24px}.item{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;padding:10px;border:1px solid #e5e2dc;border-radius:6px}.checkbox{width:18px;height:18px;border:2px solid #ccc;border-radius:4px;flex-shrink:0;margin-top:1px}.task{font-size:13px;line-height:1.5}.must{border-left:3px solid #dc2626}.should{border-left:3px solid #d97706}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e2dc;font-size:11px;color:#999}</style>
    </head><body>
    <h1>NyayaAI — Before You Sign Checklist</h1>
    <div class="sub">Document: ${analysis.documentType?.replace('_', ' ').toUpperCase()} · Risk: ${analysis.overallRisk?.toUpperCase()}</div>
    ${items.map(item => `<div class="item ${item.priority}"><div class="checkbox"></div><div class="task"><strong>[${PRIORITY_CONFIG[item.priority].label}]</strong> ${item.task}${showTamil ? `<br/><em style="color:#888;font-size:12px">${item.task_tamil}</em>` : ''}</div></div>`).join('')}
    <div class="footer">Generated by NyayaAI · nyayaai.in · For guidance only. Consult a licensed lawyer.</div>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Before You Sign Checklist</p>
          {showTamil && <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)' }}>கையெழுத்திடுவதற்கு முன் பட்டியல்</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={reset} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Reset</button>
          <button onClick={printChecklist} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Checklist
          </button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{doneCount} / {items.length} completed</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: allMustDone ? '#16a34a' : '#dc2626' }}>
            {allMustDone ? '✅ Ready to sign' : `${mustDone}/${mustItems.length} critical done`}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, transition: 'width 0.4s ease', background: allMustDone ? '#16a34a' : 'var(--primary)', width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: 11, color: allMustDone ? '#16a34a' : '#dc2626', marginTop: 6 }}>
          {allMustDone
            ? `✅ All critical items done — document is ready to sign${showTamil ? ' · அனைத்து முக்கிய பொருட்களும் முடிந்தன' : ''}`
            : `⚠️ Complete all "Must Do" items before signing${showTamil ? ' · கையெழுத்திடுவதற்கு முன் "கட்டாயம்" பொருட்களை முடிக்கவும்' : ''}`}
        </p>
      </div>

      {/* Items by category */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {category} ({categoryItems.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {categoryItems.map(item => {
              const pc = PRIORITY_CONFIG[item.priority];
              return (
                <div key={item.id} onClick={() => toggle(item.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', background: item.done ? '#f0fdf4' : 'var(--bg-secondary)', border: `1px solid ${item.done ? '#bbf7d0' : 'var(--border)'}`, borderLeft: `3px solid ${item.done ? '#16a34a' : pc.color}`, transition: 'all 0.2s', opacity: item.done ? 0.7 : 1 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `2px solid ${item.done ? '#16a34a' : pc.color}`, background: item.done ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {item.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, fontWeight: 700, display: 'inline-block', marginBottom: 4 }}>
                      {showTamil ? pc.label_tamil : pc.label}
                    </span>
                    <p style={{ fontSize: 13, color: item.done ? '#16a34a' : 'var(--text-primary)', lineHeight: 1.5, textDecoration: item.done ? 'line-through' : 'none' }}>{item.task}</p>
                    {showTamil && <p className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 3 }}>{item.task_tamil}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16 }}>
        Click any item to mark as done · Print checklist to share with family before signing
        {showTamil && <span className="tamil" style={{ display: 'block', marginTop: 2 }}>எந்த பொருளையும் கிளிக் செய்து முடிந்ததாக குறிக்கவும்</span>}
      </p>
    </div>
  );
}
