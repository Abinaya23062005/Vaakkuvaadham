'use client';

import { useState } from 'react';
import type { AppUser } from './AuthModal';

interface PaymentGateProps {
  user: AppUser;
  onPaymentSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function PaymentGate({ user, onPaymentSuccess, onClose, isOpen }: PaymentGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Payment gateway failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      // Create order on your backend
      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payment/create-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, amount: 49 }),
        }
      );

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order.');
      }

      const order = await orderRes.json();

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY',
        amount: order.amount, // in paise (4900)
        currency: 'INR',
        name: 'NyayaAI',
        description: 'Document Analysis — 1 credit',
        order_id: order.id,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#e85d26' },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payment/verify`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  userId: user.uid,
                }),
              }
            );

            const verify = await verifyRes.json();
            if (verify.success) {
              onPaymentSuccess();
              onClose();
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch {
            setError('Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const remaining = Math.max(0, 10 - user.analysisCount);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: '32px 28px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', position: 'relative', animation: 'slideUp 0.25s ease' }}>

        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef9ed', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>
            🔒
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            Free limit reached
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You've used all <strong>{10}</strong> free analyses this month.
            Pay just <strong style={{ color: 'var(--primary)' }}>₹49</strong> to analyze this document.
          </p>
          <p className="tamil" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
            இந்த மாதம் இலவச பகுப்பாய்வுகள் முடிந்தன · ₹49 செலுத்துங்கள்
          </p>
        </div>

        {/* Usage bar */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Monthly usage</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{user.analysisCount} / 10 used</span>
          </div>
          <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#dc2626', borderRadius: 99, width: '100%' }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Resets on 1st of every month · {user.email}
          </p>
        </div>

        {/* What you get */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>What you get for ₹49</p>
          {[
            { icon: '🔍', text: 'Full AI document analysis' },
            { icon: '🚩', text: 'Red flag detection with explanations' },
            { icon: '🗣️', text: 'Tamil summary + key points' },
            { icon: '🤝', text: 'Negotiation scripts for bad clauses' },
            { icon: '✅', text: 'Before You Sign checklist' },
            { icon: '📤', text: 'Downloadable PDF report' },
          ].map(item => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.text}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          ))}
        </div>

        {/* Price */}
        <div style={{ background: 'rgba(232,93,38,0.06)', border: '1px solid rgba(232,93,38,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>One-time payment</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>No subscription · No hidden charges</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>₹49</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>per analysis</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: '#dc2626' }}>⚠️ {error}</p>
          </div>
        )}

        <button onClick={handleRazorpayPayment} disabled={loading} style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 6px 20px rgba(232,93,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
              Opening payment...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Pay ₹49 with Razorpay
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Secured by Razorpay · UPI, Cards, NetBanking accepted</p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          Your free limit resets on the 1st of next month
        </p>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
