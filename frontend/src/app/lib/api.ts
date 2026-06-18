import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

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

  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return response.data;
};

export const analyzeText = async (text: string, language: string) => {
  const response = await api.post('/analysis/text', { text, language });
  return response.data;
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
