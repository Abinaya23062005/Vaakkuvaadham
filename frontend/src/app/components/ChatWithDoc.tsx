'use client';

import { useState, useRef, useEffect } from 'react';
import { chatWithDocument } from '../lib/api';
import type { Analysis } from '../lib/api';

interface ChatWithDocProps {
  analysis: Analysis;
  showTamil: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  text_tamil?: string;
}

const SUGGESTED = [
  'Can I leave before the contract ends?',
  'What happens if I miss a payment?',
  'Is this clause normal?',
  'What are my main risks here?',
];

export default function ChatWithDoc({ analysis, showTamil }: ChatWithDocProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const result = await chatWithDocument(question, analysis, 'tamil');
      setMessages(prev => [...prev, { role: 'assistant', text: result.answer, text_tamil: result.answer_tamil }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Ask AI About This Document</span>
      </div>

      {messages.length === 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Try asking:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTED.map(q => (
              <button key={q} onClick={() => send(q)} style={{ textAlign: 'left', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                💬 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-secondary)', border: msg.role === 'user' ? 'none' : '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: msg.role === 'user' ? 'white' : 'var(--text-primary)', lineHeight: 1.6 }}>{msg.text}</p>
              {msg.role === 'assistant' && showTamil && msg.text_tamil && (
                <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>{msg.text_tamil}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse 1.2s infinite ${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Ask anything about this document..."
          style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}
