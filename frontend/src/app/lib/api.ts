import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

// Attach the current Firebase ID token to every outgoing request.
// This is what lets the backend verify identity and enforce usage limits
// server-side instead of trusting any count the client sends.
api.interceptors.request.use(async (config) => {
  try {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Firebase not configured yet, or no user signed in — proceed without a token.
    // checkUsageLimit on the backend will reject with 401/402 as appropriate.
  }
  return config;
});

export class UsageLimitError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = 'LIMIT_REACHED';
  }
}
export class AuthRequiredError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = 'AUTH_REQUIRED';
  }
}
export class OCRNeededError extends Error {
  code: string;
  pageCount?: number;
  constructor(message: string, pageCount?: number) {
    super(message);
    this.code = 'OCR_NEEDED';
    this.pageCount = pageCount;
  }
}

const unwrapUsageErrors = (err: any) => {
  const code = err?.response?.data?.code;
  const msg = err?.response?.data?.error || err.message;
  if (code === 'LIMIT_REACHED') throw new UsageLimitError(msg);
  if (code === 'AUTH_REQUIRED') throw new AuthRequiredError(msg);
  if (code === 'OCR_NEEDED') throw new OCRNeededError(msg, err?.response?.data?.pageCount);
  throw err;
};

export interface RedFlag {
  clause: string;
  risk: 'high' | 'medium' | 'low';
  explanation: string;
  explanation_tamil: string;
  originalText?: string;
}

export interface SummaryPoint {
  category: string;
  point: string;
  point_tamil: string;
}

export interface Analysis {
  documentType: string;
  overallRisk: 'high' | 'medium' | 'low' | 'safe';
  jurisdiction?: string;
  summary: string;
  summary_tamil: string;
  summaryPoints: SummaryPoint[];
  redFlags: RedFlag[];
  keyParties: { role: string; name: string }[];
  importantDates: { label: string; date: string }[];
  financialTerms: { label: string; amount: string }[];
}

export const RISK_COLORS: Record<string, string> = {
  high: '#dc2626', medium: '#d97706', low: '#2563eb', safe: '#16a34a',
};

export const RISK_LABELS: Record<string, string> = {
  high: 'High Risk', medium: 'Medium Risk', low: 'Low Risk', safe: 'Safe',
};

export const DOC_TYPE_LABELS: Record<string, string> = {
  rental_agreement: '🏠 Rental Agreement',
  job_offer: '💼 Job Offer',
  court_notice: '⚖️ Court Notice',
  other: '📄 Legal Document',
};

export const uploadDocument = async (
  file: File,
  language: string,
  onProgress?: (percent: number) => void
): Promise<{ analysis: Analysis; processingTime: number }> => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('language', language);

  try {
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return response.data;
  } catch (err) {
    return unwrapUsageErrors(err);
  }
};

export const analyzeText = async (text: string, language: string) => {
  try {
    const response = await api.post('/analysis/text', { text, language });
    return response.data;
  } catch (err) {
    return unwrapUsageErrors(err);
  }
};

export const chatWithDocument = async (question: string, analysis: Analysis, language: string) => {
  const response = await api.post('/analysis/chat', { question, analysis, language });
  return response.data;
};

export const compareDocuments = async (originalAnalysis: Analysis, newDocumentText: string) => {
  const response = await api.post('/analysis/compare', { originalAnalysis, newDocumentText });
  return response.data;
};

export const getNegotiationTips = async (analysis: Analysis) => {
  const response = await api.post('/analysis/negotiate', { analysis });
  return response.data;
};

export const generateDocument = async (templateId: string, formData: Record<string, string>) => {
  const response = await api.post('/generate/document', { templateId, formData });
  return response.data;
};

export const getSampleAnalysis = async () => {
  const response = await api.get('/analysis/sample');
  return response.data;
};

export default api;
