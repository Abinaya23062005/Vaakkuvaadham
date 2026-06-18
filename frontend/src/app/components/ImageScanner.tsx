'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageScannerProps {
  onTextExtracted: (text: string) => void;
}

export default function ImageScanner({ onTextExtracted }: ImageScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const processImage = async (file: File) => {
    setError('');
    setScanning(true);
    setProgress(0);
    setPreview(URL.createObjectURL(file));

    try {
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(file, 'eng+tam', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });

      const text = result.data.text.trim();
      if (text.length < 50) {
        setError('Could not extract enough text. Try a clearer photo with better lighting.');
        setScanning(false);
        return;
      }
      onTextExtracted(text);
    } catch (err) {
      setError('Failed to scan image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) processImage(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div>
      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border-strong)'}`,
        borderRadius: 14, padding: '32px 20px', textAlign: 'center',
        cursor: 'pointer', background: isDragActive ? 'rgba(232,93,38,0.04)' : 'var(--bg-secondary)',
      }}>
        <input {...getInputProps()} capture="environment" />
        {preview && !scanning ? (
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, marginBottom: 12 }} />
        ) : (
          <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
        )}
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          {scanning ? 'Scanning document...' : 'Take a photo or upload an image'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports English and Tamil text</p>

        {scanning && (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', maxWidth: 200, margin: '0 auto' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, transition: 'width 0.2s' }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{progress}%</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
