'use client';

import type { Analysis } from '../lib/api';

interface WhatsAppShareProps {
  analysis: Analysis;
  fileName: string;
  showTamil: boolean;
}

export default function WhatsAppShare({ analysis, fileName, showTamil }: WhatsAppShareProps) {
  const shareToWhatsApp = () => {
    const riskEmoji = analysis.overallRisk === 'high' ? '🔴' : analysis.overallRisk === 'medium' ? '🟡' : analysis.overallRisk === 'safe' ? '🟢' : '🔵';

    const text = `📋 *NyayaAI Document Analysis*\n\n` +
      `📄 ${fileName}\n` +
      `${riskEmoji} Risk: *${analysis.overallRisk.toUpperCase()}*\n\n` +
      `${analysis.summary}\n\n` +
      (showTamil ? `${analysis.summary_tamil}\n\n` : '') +
      `🚩 ${analysis.redFlags?.length || 0} red flag(s) found\n\n` +
      `_Analyzed for free at NyayaAI_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Share with family</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Send this analysis on WhatsApp for a second opinion</p>
      </div>
      <button onClick={shareToWhatsApp} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25d366', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
        Share on WhatsApp
      </button>
    </div>
  );
}
