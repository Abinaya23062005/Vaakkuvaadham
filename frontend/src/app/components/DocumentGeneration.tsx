'use client';

import { useState } from 'react';
import { generateDocument } from '../lib/api';

interface DocumentGenerationProps {
  showTamil: boolean;
}

const TEMPLATES = [
  { id: 'rental', label: 'Rental Agreement', icon: '🏠', fields: ['landlordName', 'tenantName', 'address', 'rent', 'deposit', 'startDate', 'noticePeriod'] },
  { id: 'job_offer', label: 'Job Offer Letter', icon: '💼', fields: ['companyName', 'employeeName', 'designation', 'salary', 'joiningDate', 'noticePeriod'] },
];

const FIELD_LABELS: Record<string, string> = {
  landlordName: 'Landlord Name', tenantName: 'Tenant Name', address: 'Property Address',
  rent: 'Monthly Rent (₹)', deposit: 'Security Deposit (₹)', startDate: 'Start Date', noticePeriod: 'Notice Period (days)',
  companyName: 'Company Name', employeeName: 'Employee Name', designation: 'Designation',
  salary: 'Annual CTC (₹)', joiningDate: 'Joining Date',
};

export default function DocumentGeneration({ showTamil }: DocumentGenerationProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [error, setError] = useState('');

  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerate = async () => {
    if (!template) return;
    const missing = template.fields.filter(f => !formData[f]?.trim());
    if (missing.length > 0) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await generateDocument(template.id, formData);
      setGenerated(result.document);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadDoc = () => {
    const blob = new Blob([generated], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.label.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  if (generated) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Generated Document</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={downloadDoc} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Download</button>
            <button onClick={() => { setGenerated(''); setSelectedTemplate(null); setFormData({}); }} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>New</button>
          </div>
        </div>
        <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', maxHeight: 500, overflowY: 'auto' }}>
          {generated}
        </pre>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Generate a Fair Document</span>
      </div>

      {!selectedTemplate ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{ padding: '20px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedTemplate(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer', marginBottom: 14 }}>← Back to templates</button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {template?.fields.map(field => (
              <div key={field}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{FIELD_LABELS[field]}</label>
                <input value={formData[field] || ''} onChange={e => setFormData(p => ({ ...p, [field]: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }} />
              </div>
            ))}
          </div>

          {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>⚠️ {error}</p>}

          <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Generating...' : 'Generate Document'}
          </button>
        </div>
      )}
    </div>
  );
}
