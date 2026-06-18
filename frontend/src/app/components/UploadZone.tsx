'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FileIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [dragError, setDragError] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setDragError('');
    if (rejected.length > 0) {
      const err = rejected[0].errors[0];
      if (err.code === 'file-too-large') setDragError('File too large. Maximum size is 10MB.');
      else if (err.code === 'file-invalid-type') setDragError('Only PDF files are supported.');
      else setDragError(err.message);
      return;
    }
    if (accepted.length > 0) onFileSelect(accepted[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled,
  });

  const isActive = isDragActive || isHovered;

  return (
    <div>
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: `2px dashed ${isActive ? 'var(--primary)' : 'var(--border-strong)'}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: isActive ? 'rgba(232,93,38,0.03)' : 'var(--bg-secondary)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.4 : 1,
          transform: isActive ? 'scale(1.005)' : 'scale(1)',
        }}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 18,
          background: isActive ? 'rgba(232,93,38,0.1)' : 'var(--bg-card)',
          border: `1px solid ${isActive ? 'rgba(232,93,38,0.3)' : 'var(--border)'}`,
          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
          marginBottom: 20, transition: 'all 0.25s',
          transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isActive ? '0 8px 24px rgba(232,93,38,0.15)' : 'var(--shadow)',
        }}>
          {isDragActive ? <FileIcon /> : <UploadIcon />}
        </div>

        <h3 style={{
          fontSize: 18, fontWeight: 700,
          color: isActive ? 'var(--primary)' : 'var(--text-primary)',
          marginBottom: 8, transition: 'color 0.2s',
        }}>
          {isDragActive ? 'Release to analyze' : 'Drop your legal document here'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
          PDF only · Maximum 10MB
        </p>

        {/* Doc type pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', label: 'Rental Agreement' },
            { icon: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z', label: 'Job Offer' },
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Court Notice' },
          ].map(item => (
            <span key={item.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, padding: '5px 12px', borderRadius: 99,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          style={{
            background: 'var(--primary)', color: 'white', border: 'none',
            borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: '0 4px 12px rgba(232,93,38,0.3)',
          }}
        >
          Browse Files
        </button>
      </div>

      {dragError && (
        <div style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 13, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>⚠ {dragError}</span>
          <button onClick={() => setDragError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <ShieldIcon /> Your document is deleted after analysis · We never store your files
      </p>
    </div>
  );
}
