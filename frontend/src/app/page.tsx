'use client';

import { useState, useCallback, useEffect } from 'react';
import UploadZone from './components/UploadZone';
import Processing from './components/Processing';
import SummaryPanel from './components/SummaryPanel';
import RedFlagsPanel from './components/RedFlagsPanel';
import ChatWithDoc from './components/ChatWithDoc';
import VoiceSummary from './components/VoiceSummary';
import VoiceInput from './components/VoiceInput';
import DownloadReport from './components/DownloadReport';
import ImageScanner from './components/ImageScanner';
import CompareDocuments from './components/CompareDocuments';
import WhatsAppShare from './components/WhatsAppShare';
import NegotiationCoach from './components/NegotiationCoach';
import DocumentGeneration from './components/DocumentGeneration';
import LanguageSelector from './components/LanguageSelector';
import RiskScoreCard from './components/RiskScoreCard';
import ContractReminder from './components/ContractReminder';
import DocumentHistory, { saveToHistory } from './components/DocumentHistory';
import KnowYourRights from './components/KnowYourRights';
import ClauseLibrary from './components/ClauseLibrary';
import BeforeYouSign from './components/BeforeYouSign';
import AuthModal, { type AppUser } from './components/AuthModal';
import PaymentGate from './components/PaymentGate';
import UsageIndicator from './components/UsageIndicator';
import LandingPage from './components/LandingPage';
import { uploadDocument, analyzeText, getSampleAnalysis } from './lib/api';
import type { Analysis } from './lib/api';

type AppState = 'landing' | 'idle' | 'processing' | 'results' | 'error';
type ViewMode = 'english' | 'tamil' | 'split';
type ResultTab = 'summary' | 'redflags' | 'chat' | 'negotiate' | 'compare' | 'generate' | 'checklist';
type InputMode = 'upload' | 'text' | 'image';
type HomeTab = 'analyze' | 'history' | 'rights' | 'clauses';

const FREE_LIMIT = 10;
const RISK_COLORS: Record<string, string> = { high: '#dc2626', medium: '#d97706', low: '#2563eb', safe: '#16a34a' };
const RISK_BG_L: Record<string, string> = { high: '#fef2f2', medium: '#fffbeb', low: '#eff6ff', safe: '#f0fdf4' };
const RISK_BG_D: Record<string, string> = { high: '#450a0a', medium: '#451a03', low: '#0c1a3d', safe: '#052e16' };
const RISK_BORDER: Record<string, string> = { high: '#fecaca', medium: '#fde68a', low: '#bfdbfe', safe: '#bbf7d0' };

// SVG Icons
const I = {
  Scale: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M8 7H3l3 6-3 6h5M16 7h5l-3 6 3 6h-5M8 7h8"/></svg>,
  Sun: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Back: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  Upload: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Image: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Edit: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  List: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>,
  Flag: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Chat: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Heart: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Compare: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  Doc: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Shield: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  History: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>,
  Rights: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Book: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Analyze: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Split: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/></svg>,
  Globe: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [state, setState] = useState<AppState>('landing');
  const [homeTab, setHomeTab] = useState<HomeTab>('analyze');
  const [language, setLanguage] = useState('tamil');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeTab, setActiveTab] = useState<ResultTab>('summary');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [currentFile, setCurrentFile] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [mounted, setMounted] = useState(false);
  const [tamilUI, setTamilUI] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle('dark', isDark);
    // Restore user session from localStorage
    try {
      const saved = localStorage.getItem('nyayaai_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const showTamil = viewMode === 'tamil' || viewMode === 'split';
  const t = (en: string, ta: string) => tamilUI ? ta : en;

  // Save user to localStorage when it changes
  const handleLogin = (u: AppUser) => {
    setUser(u);
    localStorage.setItem('nyayaai_user', JSON.stringify(u));
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  };

  // Check usage limit before analysis
  const checkAndProceed = (action: () => void) => {
    if (!user) {
      setPendingAction(() => action);
      setShowAuth(true);
      return;
    }
    const remaining = FREE_LIMIT - user.analysisCount;
    if (remaining <= 0 && (user.paidCredits || 0) <= 0 && user.plan !== 'pro') {
      setPendingAction(() => action);
      setShowPayment(true);
      return;
    }
    action();
  };

  const handleFileSelect = useCallback((file: File) => {
    checkAndProceed(async () => {
      setCurrentFile(file.name);
      setState('processing');
      setUploadProgress(0);
      try {
        const result = await uploadDocument(file, language, setUploadProgress);
        setAnalysis(result.analysis);
        setProcessingTime(result.processingTime);
        saveToHistory(result.analysis, file.name);
        // Update local user count
        if (user) {
          const updated = { ...user, analysisCount: user.analysisCount + 1 };
          setUser(updated);
          localStorage.setItem('nyayaai_user', JSON.stringify(updated));
          // Also update Firestore
          try {
            const { incrementAnalysisCount } = await import('./lib/firebase');
            await incrementAnalysisCount(user.uid);
          } catch {}
        }
        setState('results');
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || err.message || 'Analysis failed.');
        setState('error');
      }
    });
  }, [language, user]);

  const handleTextAnalyze = useCallback(() => {
    if (!textInput.trim() || textInput.length < 100) return;
    checkAndProceed(async () => {
      setState('processing');
      setCurrentFile('Pasted document');
      try {
        const result = await analyzeText(textInput, language);
        setAnalysis(result.analysis);
        setProcessingTime(0);
        saveToHistory(result.analysis, 'Pasted document');
        if (user) {
          const updated = { ...user, analysisCount: user.analysisCount + 1 };
          setUser(updated);
          localStorage.setItem('nyayaai_user', JSON.stringify(updated));
          try {
            const { incrementAnalysisCount } = await import('./lib/firebase');
            await incrementAnalysisCount(user.uid);
          } catch {}
        }
        setState('results');
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || err.message || 'Analysis failed.');
        setState('error');
      }
    });
  }, [textInput, language, user]);

  const handleSampleDemo = () => {
    checkAndProceed(async () => {
      setState('processing');
      setCurrentFile('Sample Rental Agreement.pdf');
      try {
        const sample = await getSampleAnalysis();
        setAnalysis(sample as Analysis);
        setProcessingTime(2800);
        setState('results');
      } catch {
        setErrorMsg('Demo failed.');
        setState('error');
      }
    });
  };

  const handlePaymentSuccess = async () => {
    // Add paid credit to user
    if (user) {
      try {
        const { addPaidCredit } = await import('./lib/firebase');
        await addPaidCredit(user.uid);
      } catch {}
      const updated = { ...user, paidCredits: (user.paidCredits || 0) + 1 };
      setUser(updated);
      localStorage.setItem('nyayaai_user', JSON.stringify(updated));
    }
    // Execute pending action
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  };

  const logout = async () => {
    try {
      const { signOutUser } = await import('./lib/firebase');
      await signOutUser();
    } catch {}
    localStorage.removeItem('nyayaai_user');
    setUser(null);
    setShowUserMenu(false);
  };

  const reset = () => {
    setState('idle');
    setAnalysis(null);
    setErrorMsg('');
    setUploadProgress(0);
    setTextInput('');
    setActiveTab('summary');
    setHomeTab('analyze');
  };

  const RESULT_TABS = [
    { id: 'summary' as ResultTab, Icon: I.List, label: t('Summary', 'சுருக்கம்') },
    { id: 'redflags' as ResultTab, Icon: I.Flag, label: `${t('Flags', 'ஆபத்து')}${analysis ? ` (${analysis.redFlags?.length || 0})` : ''}` },
    { id: 'checklist' as ResultTab, Icon: I.Check, label: t('Checklist', 'பட்டியல்') },
    { id: 'chat' as ResultTab, Icon: I.Chat, label: t('Ask AI', 'கேள்') },
    { id: 'negotiate' as ResultTab, Icon: I.Heart, label: t('Negotiate', 'பேச்சு') },
    { id: 'compare' as ResultTab, Icon: I.Compare, label: t('Compare', 'ஒப்பிடு') },
    { id: 'generate' as ResultTab, Icon: I.Doc, label: t('Generate', 'உருவாக்கு') },
  ];

  const HOME_TABS = [
    { id: 'analyze' as HomeTab, Icon: I.Analyze, label: t('Analyze', 'பகுப்பாய்வு') },
    { id: 'history' as HomeTab, Icon: I.History, label: t('History', 'வரலாறு') },
    { id: 'rights' as HomeTab, Icon: I.Rights, label: t('Rights', 'உரிமைகள்') },
    { id: 'clauses' as HomeTab, Icon: I.Book, label: t('Clauses', 'விதிகள்') },
  ];

  if (!mounted) return null;

  const card: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' };

  const Navbar = () => (
    <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setState('landing')}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 12px rgba(232,93,38,0.35)' }}><I.Scale /></div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Nyaya<span style={{ color: 'var(--primary)' }}>AI</span></div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em', fontWeight: 500 }}>LEGAL CLARITY FOR EVERY INDIAN</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Tamil toggle */}
        <button onClick={() => setTamilUI(!tamilUI)} style={{ padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 700, background: tamilUI ? 'rgba(232,93,38,0.1)' : 'var(--bg-secondary)', border: `1px solid ${tamilUI ? 'rgba(232,93,38,0.3)' : 'var(--border)'}`, color: tamilUI ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
          <span className="tamil">{tamilUI ? 'EN' : 'த'}</span>
        </button>

        {/* Back button */}
        {(state === 'results' || state === 'idle') && (
          <button onClick={state === 'results' ? reset : () => setState('landing')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
            <I.Back /> {state === 'results' ? t('New', 'புதியது') : t('Home', 'முகப்பு')}
          </button>
        )}

        {/* Usage indicator - compact */}
        {user && state !== 'landing' && (
          <UsageIndicator user={user} compact onUpgrade={() => setShowPayment(true)} />
        )}

        {/* Auth */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '5px 10px', cursor: 'pointer' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name?.split(' ')[0]}</span>
            </button>
            {showUserMenu && (
              <div style={{ position: 'absolute', right: 0, top: 44, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 8, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100 }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</p>
                  <div style={{ marginTop: 6 }}>
                    <UsageIndicator user={user} onUpgrade={() => setShowPayment(true)} />
                  </div>
                </div>
                <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', borderRadius: 8, fontSize: 13, color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>
                  <I.LogOut /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(232,93,38,0.3)' }}>
            <I.User /> {t('Sign In', 'உள்நுழை')}
          </button>
        )}

        <button onClick={() => setIsDark(!isDark)} style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          {isDark ? <I.Sun /> : <I.Moon />}
        </button>
      </div>
    </nav>
  );

  const MobileBottomNav = () => (
    <div className="bottom-nav" style={{ justifyContent: 'space-around' }}>
      {RESULT_TABS.slice(0, 5).map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: '6px 4px', cursor: 'pointer', color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
          <tab.Icon />
          <span style={{ fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap' }}>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-tertiary)' }} onClick={() => showUserMenu && setShowUserMenu(false)}>

      {/* Modals */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} onLogin={handleLogin} />
      {user && <PaymentGate isOpen={showPayment} user={user} onClose={() => setShowPayment(false)} onPaymentSuccess={handlePaymentSuccess} />}

      {/* LANDING */}
      {state === 'landing' && (
        <>
          <Navbar />
          <LandingPage isDark={isDark} onGetStarted={() => setState('idle')} onLogin={() => setShowAuth(true)} />
        </>
      )}

      {/* IDLE */}
      {state === 'idle' && (
        <>
          <Navbar />
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 80px' }} className="fade-in">

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 900, lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.03em' }}>
                {t('Legal Clarity for', 'சட்ட தெளிவு')} <span style={{ color: 'var(--primary)' }}>{t('Every Indian', 'ஒவ்வொருவருக்கும்')}</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                {t('Upload any legal document — rental agreement, job offer, or court notice.', 'எந்த சட்ட ஆவணத்தையும் பதிவேற்றுங்கள்.')}
              </p>
            </div>

            {/* Sign in prompt for guests */}
            {!user && (
              <div style={{ ...card, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>🎉 Sign in for 10 free analyses per month</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Without sign-in: 3 analyses · With sign-in: 10 free + pay ₹49 after</p>
                </div>
                <button onClick={() => setShowAuth(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  Sign In Free →
                </button>
              </div>
            )}

            {/* Home tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
              {HOME_TABS.map(tab => (
                <button key={tab.id} onClick={() => setHomeTab(tab.id)} style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: homeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2, color: homeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <tab.Icon /> {tab.label}
                </button>
              ))}
            </div>

            {homeTab === 'analyze' && (
              <div className="fade-in">
                <div style={{ ...card, padding: 24, marginBottom: 16 }}>
                  {/* Input mode switcher */}
                  <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
                    {[
                      { id: 'upload' as InputMode, Icon: I.Upload, label: t('Upload PDF', 'PDF') },
                      { id: 'image' as InputMode, Icon: I.Image, label: t('Scan Image', 'ஸ்கேன்') },
                      { id: 'text' as InputMode, Icon: I.Edit, label: t('Paste Text', 'உரை') },
                    ].map(m => (
                      <button key={m.id} onClick={() => setInputMode(m.id)} style={{ flex: 1, padding: '9px 8px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: inputMode === m.id ? 'var(--bg-card)' : 'transparent', color: inputMode === m.id ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: inputMode === m.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <m.Icon /> {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="fade-in" key={inputMode}>
                    {inputMode === 'upload' && <UploadZone onFileSelect={handleFileSelect} />}
                    {inputMode === 'image' && <ImageScanner onTextExtracted={(text) => { setTextInput(text); setInputMode('text'); }} />}
                    {inputMode === 'text' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>🎤 {t('Voice Input', 'குரல் உள்ளீடு')}</p>
                          <VoiceInput onTranscript={(tx) => setTextInput(p => (p + ' ' + tx).trim())} language={language} />
                        </div>
                        <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                          placeholder={t('Paste your legal document text here... (min 100 characters)', 'உங்கள் சட்ட ஆவண உரையை இங்கே ஒட்டுங்கள்...')}
                          style={{ width: '100%', minHeight: 160, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{textInput.length}/15000</span>
                          <button onClick={handleTextAnalyze} disabled={textInput.length < 100} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: textInput.length < 100 ? 'not-allowed' : 'pointer', opacity: textInput.length < 100 ? 0.4 : 1 }}>
                            {t('Analyze →', 'பகுப்பாய்வு →')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ ...card, padding: 20, marginBottom: 16 }}>
                  <LanguageSelector selected={language} onChange={setLanguage} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <button onClick={handleSampleDemo} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    {t('📄 Try with a sample rental agreement →', '📄 மாதிரி ஒப்பந்தத்துடன் முயற்சிக்கவும் →')}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                  {[
                    { icon: '🔍', title: t('Deep Analysis', 'ஆழமான பகுப்பாய்வு'), color: '#e85d26' },
                    { icon: '🚩', title: t('Red Flags', 'ஆபத்து விதிகள்'), color: '#dc2626' },
                    { icon: '🗣️', title: t('Tamil Support', 'தமிழ் ஆதரவு'), color: '#7c3aed' },
                    { icon: '🤝', title: t('Negotiate', 'பேச்சுவார்த்தை'), color: '#16a34a' },
                    { icon: '✅', title: t('Checklist', 'பட்டியல்'), color: '#2563eb' },
                    { icon: '📋', title: t('Generate Docs', 'ஆவணங்கள்'), color: '#d97706' },
                  ].map(f => (
                    <div key={f.title} style={{ ...card, padding: '14px 12px', textAlign: 'center', borderRadius: 14, transition: 'all 0.2s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{f.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{f.title}</div>
                    </div>
                  ))}
                </div>

                <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'flex-start', borderRadius: 12 }}>
                  <div style={{ color: 'var(--primary)', flexShrink: 0 }}><I.Shield /></div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {t('Privacy Protected. Documents analyzed by Groq AI — never stored permanently. Auto-deleted after 24 hours.', 'தனியுரிமை பாதுகாக்கப்படுகிறது. ஆவணங்கள் 24 மணி நேரத்திற்கு பிறகு தானாகவே நீக்கப்படும்.')}
                  </p>
                </div>
              </div>
            )}

            {homeTab === 'history' && (
              <div className="fade-in">
                <div style={{ ...card, padding: 20, marginBottom: 14 }}>
                  <DocumentHistory showTamil={showTamil} onRestore={(a, f) => { setAnalysis(a); setCurrentFile(f); setState('results'); }} />
                </div>
                <div style={{ ...card, padding: 20, borderRadius: 14 }}>
                  <ContractReminder showTamil={showTamil} />
                </div>
              </div>
            )}
            {homeTab === 'rights' && <div className="fade-in"><div style={{ ...card, padding: 20 }}><KnowYourRights showTamil={showTamil} /></div></div>}
            {homeTab === 'clauses' && <div className="fade-in"><div style={{ ...card, padding: 20 }}><ClauseLibrary showTamil={showTamil} /></div></div>}
          </div>
        </>
      )}

      {/* PROCESSING */}
      {state === 'processing' && (
        <>
          <Navbar />
          <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 16px' }}>
            <Processing fileName={currentFile} uploadProgress={uploadProgress} />
          </div>
        </>
      )}

      {/* ERROR */}
      {state === 'error' && (
        <>
          <Navbar />
          <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
            <div style={{ ...card, padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{t('Analysis Failed', 'பகுப்பாய்வு தோல்வி')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>{errorMsg}</p>
              <button onClick={reset} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {t('Try Again', 'மீண்டும் முயற்சி')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* RESULTS */}
      {state === 'results' && analysis && (
        <>
          <Navbar />
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 100px' }} className="fade-in">

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{t('Analysis complete', 'பகுப்பாய்வு முடிந்தது')} · {processingTime > 0 ? `${(processingTime / 1000).toFixed(1)}s` : 'instant'}</p>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{currentFile}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DownloadReport analysis={analysis} fileName={currentFile} />
                <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 9, padding: 3, border: '1px solid var(--border)' }}>
                  {(['split', 'english', 'tamil'] as ViewMode[]).map(v => (
                    <button key={v} onClick={() => setViewMode(v)} style={{ padding: '5px 9px', borderRadius: 7, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: viewMode === v ? 'var(--bg-card)' : 'transparent', color: viewMode === v ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {v === 'split' ? <><I.Split /> Split</> : v === 'english' ? <><I.Globe /> EN</> : <><I.Globe /> TA</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk banner */}
            <div style={{ padding: '14px 18px', borderRadius: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: isDark ? RISK_BG_D[analysis.overallRisk] : RISK_BG_L[analysis.overallRisk], border: `1px solid ${RISK_BORDER[analysis.overallRisk]}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: RISK_COLORS[analysis.overallRisk] + '20', border: `2px solid ${RISK_COLORS[analysis.overallRisk]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {analysis.overallRisk === 'high' ? '🔴' : analysis.overallRisk === 'medium' ? '🟡' : analysis.overallRisk === 'safe' ? '🟢' : '🔵'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: RISK_COLORS[analysis.overallRisk] }}>
                  {analysis.overallRisk === 'high' ? t('High Risk — Review carefully before signing', 'அதிக ஆபத்து — கவனமாக சரிபாருங்கள்') :
                   analysis.overallRisk === 'medium' ? t('Medium Risk — Some concerns', 'நடுத்தர ஆபத்து — சில கவலைகள்') :
                   analysis.overallRisk === 'safe' ? t('Safe — Document appears fair', 'பாதுகாப்பானது') :
                   t('Low Risk — Minor issues', 'குறைந்த ஆபத்து')}
                </p>
                {showTamil && <p className="tamil" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {analysis.overallRisk === 'high' ? 'கையெழுத்திட முன் கவனமாக சரிபாருங்கள்' : analysis.overallRisk === 'medium' ? 'சில கவலைகள் கண்டறியப்பட்டன' : analysis.overallRisk === 'safe' ? 'ஆவணம் பாதுகாப்பானது' : 'சிறிய சிக்கல்கள் உள்ளன'}
                </p>}
              </div>
              {(analysis.redFlags?.filter(f => f.risk === 'high').length ?? 0) > 0 && (
                <span style={{ background: '#dc2626', color: 'white', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {analysis.redFlags.filter(f => f.risk === 'high').length} high risk
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>
              <RiskScoreCard analysis={analysis} fileName={currentFile} showTamil={showTamil} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ ...card, padding: '12px 16px' }}><VoiceSummary analysis={analysis} showTamil={showTamil} /></div>
                <ContractReminder documentName={currentFile} showTamil={showTamil} />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 16, overflowX: 'auto' }} className="desktop-tabs">
              {RESULT_TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -2, color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <tab.Icon /> {tab.label}
                </button>
              ))}
            </div>

            <div style={{ ...card, padding: '22px 18px', marginBottom: 12 }} className="fade-in" key={activeTab}>
              {activeTab === 'summary' && <SummaryPanel analysis={analysis} showTamil={showTamil} viewMode={viewMode} />}
              {activeTab === 'redflags' && <RedFlagsPanel flags={analysis.redFlags || []} showTamil={showTamil} />}
              {activeTab === 'checklist' && <BeforeYouSign analysis={analysis} showTamil={showTamil} />}
              {activeTab === 'chat' && <ChatWithDoc analysis={analysis} showTamil={showTamil} />}
              {activeTab === 'negotiate' && <NegotiationCoach analysis={analysis} showTamil={showTamil} />}
              {activeTab === 'compare' && <CompareDocuments currentAnalysis={analysis} showTamil={showTamil} />}
              {activeTab === 'generate' && <DocumentGeneration showTamil={showTamil} />}
            </div>

            <div style={{ ...card, padding: 18, marginBottom: 10 }}>
              <WhatsAppShare analysis={analysis} fileName={currentFile} showTamil={showTamil} />
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <I.Shield /> {t('Analyzed securely · Not stored permanently · Consult a lawyer for legal advice', 'பாதுகாப்பாக பகுப்பாய்வு செய்யப்பட்டது')}
            </p>
          </div>
          <MobileBottomNav />
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeIn 0.35s ease; }
        @media (max-width: 768px) { .bottom-nav { display: flex !important; } .desktop-tabs { display: none !important; } }
      `}</style>
    </div>
  );
}
