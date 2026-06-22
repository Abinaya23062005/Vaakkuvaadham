'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  language?: string;
}

const LANG_CODES: Record<string, string> = {
  tamil: 'ta-IN', english: 'en-IN', telugu: 'te-IN',
  kannada: 'kn-IN', malayalam: 'ml-IN', hindi: 'hi-IN',
};

const LISTEN_LABELS: Record<string, string> = {
  tamil: 'கேட்கிறது...', english: 'Listening...', telugu: 'వింటోంది...',
  kannada: 'ಕೇಳುತ್ತಿದೆ...', malayalam: 'കേൾക്കുന്നു...', hindi: 'सुन रहा है...',
};

export default function VoiceInput({ onTranscript, placeholder, language = 'english' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [bars, setBars] = useState<number[]>(Array(8).fill(4));
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const barInterval = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SR);
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (barInterval.current) clearInterval(barInterval.current);
    };
  }, []);

  const animateBars = () => {
    barInterval.current = setInterval(() => {
      setBars(Array(8).fill(0).map(() => Math.random() * 24 + 4));
    }, 120);
  };

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    setError('');
    setTranscript('');
    transcriptRef.current = '';

    const recognition = new SR();
    recognition.lang = LANG_CODES[language] || 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      animateBars();
    };

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      const text = final || interim;
      setTranscript(text);
      transcriptRef.current = text;
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') setError('No speech detected. Try again.');
      else if (e.error === 'not-allowed') setError('Microphone access denied. Allow mic in browser settings.');
      else if (e.error === 'network') setError('Network error. Check your connection.');
      else setError(`Error: ${e.error}`);
      setIsListening(false);
      if (barInterval.current) clearInterval(barInterval.current);
      setBars(Array(8).fill(4));
    };

    recognition.onend = () => {
      setIsListening(false);
      if (barInterval.current) clearInterval(barInterval.current);
      setBars(Array(8).fill(4));
      if (transcriptRef.current.trim()) {
        onTranscript(transcriptRef.current.trim());
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setError('Could not start microphone. Try refreshing the page.');
    }
  }, [language, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  if (!isSupported) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span style={{ fontSize: 12, color: '#dc2626' }}>Voice input requires Chrome browser</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Mic button */}
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
            background: isListening ? '#dc2626' : 'var(--bg-tertiary)',
            border: isListening ? 'none' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0, position: 'relative',
            boxShadow: isListening ? '0 0 0 4px rgba(220,38,38,0.2)' : 'none',
          }}
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        {/* Status area */}
        {isListening ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Animated bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
              {bars.map((h, i) => (
                <div key={i} style={{
                  width: 3, height: h, background: '#dc2626',
                  borderRadius: 99, transition: 'height 0.12s ease',
                }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
              {LISTEN_LABELS[language] || 'Listening...'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click stop when done</span>
          </div>
        ) : transcript ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>Voice captured! Added to text.</span>
          </div>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {placeholder || 'Click mic to speak your legal document text'}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16 }}>×</button>
        </div>
      )}
    </div>
  );
}
