'use client';

import { useState, useEffect } from 'react';

interface Reminder {
  id: string;
  documentName: string;
  expiryDate: string;
  notes: string;
  addedOn: string;
}

interface ContractReminderProps {
  documentName?: string;
  showTamil?: boolean;
}

export default function ContractReminder({ documentName = '', showTamil = false }: ContractReminderProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ documentName, expiryDate: '', notes: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nyayaai_reminders');
      if (stored) setReminders(JSON.parse(stored));
    } catch {}
  }, []);

  const saveReminders = (updated: Reminder[]) => {
    setReminders(updated);
    localStorage.setItem('nyayaai_reminders', JSON.stringify(updated));
  };

  const addReminder = () => {
    if (!form.expiryDate || !form.documentName) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      documentName: form.documentName,
      expiryDate: form.expiryDate,
      notes: form.notes,
      addedOn: new Date().toISOString(),
    };
    saveReminders([...reminders, reminder]);
    setSaved(true);
    setShowForm(false);
    setForm({ documentName: '', expiryDate: '', notes: '' });
    setTimeout(() => setSaved(false), 3000);
  };

  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return '#dc2626';
    if (days <= 7) return '#dc2626';
    if (days <= 30) return '#d97706';
    return '#16a34a';
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today!';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 16, padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Contract Expiry Reminders</span>
          {showTamil && <span className="tamil" style={{ fontSize: 11, color: 'var(--text-muted)' }}>ஒப்பந்த காலாவதி நினைவூட்டல்</span>}
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? 'var(--bg-secondary)' : 'var(--primary)',
          color: showForm ? 'var(--text-secondary)' : 'white',
          border: showForm ? '1px solid var(--border)' : 'none',
          borderRadius: 8, padding: '6px 12px', fontSize: 12,
          fontWeight: 600, cursor: 'pointer',
        }}>
          {showForm ? 'Cancel' : '+ Add Reminder'}
        </button>
      </div>

      {saved && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
          padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#16a34a',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Reminder saved! We'll remind you 30 days before expiry.
          {showTamil && <span className="tamil"> காலாவதி நினைவூட்டல் சேமிக்கப்பட்டது!</span>}
        </div>
      )}

      {showForm && (
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12,
          border: '1px solid var(--border)', padding: 16, marginBottom: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
              Document Name
            </label>
            <input
              value={form.documentName}
              onChange={e => setForm(p => ({ ...p, documentName: e.target.value }))}
              placeholder="e.g. Flat rental agreement - Chennai"
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', fontSize: 13,
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
              Agreement Expiry Date
              {showTamil && <span className="tamil" style={{ marginLeft: 6 }}>ஒப்பந்தம் முடியும் தேதி</span>}
            </label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))}
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', fontSize: 13,
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Notes (optional)</label>
            <input
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Contact landlord 45 days before"
              style={{
                width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '8px 12px', fontSize: 13,
                color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            onClick={addReminder}
            disabled={!form.documentName || !form.expiryDate}
            style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 600,
              cursor: !form.documentName || !form.expiryDate ? 'not-allowed' : 'pointer',
              opacity: !form.documentName || !form.expiryDate ? 0.4 : 1,
            }}
          >
            Save Reminder
          </button>
        </div>
      )}

      {reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border-strong)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 8px', display: 'block' }}>
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ fontSize: 13, marginBottom: 4 }}>No reminders set</p>
          <p style={{ fontSize: 11 }}>Add a reminder to track your agreement expiry dates</p>
          {showTamil && <p className="tamil" style={{ fontSize: 11, marginTop: 4 }}>ஒப்பந்த காலாவதி தேதிகளை கண்காணிக்க நினைவூட்டல் சேர்க்கவும்</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reminders.map(r => {
            const days = getDaysLeft(r.expiryDate);
            const color = getDaysColor(days);
            return (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-secondary)', borderRadius: 10,
                border: `1px solid ${days <= 30 ? color + '40' : 'var(--border)'}`,
                padding: '12px 14px',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: color + '15',
                  border: `1px solid ${color}30`, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{Math.abs(days)}</span>
                  <span style={{ fontSize: 9, color, fontWeight: 500 }}>days</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{r.documentName}</p>
                  <p style={{ fontSize: 11, color }}>
                    {getDaysLabel(days)} · Expires {new Date(r.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.notes && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.notes}</p>}
                </div>
                <button onClick={() => deleteReminder(r.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
