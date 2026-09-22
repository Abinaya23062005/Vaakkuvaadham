// AFTER
const Cerebras = require('@cerebras/cerebras_cloud_sdk');
const logger = require('../utils/logger');

const groq = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });
const MODEL = 'llama3.1-8b';   // or 'llama-3.3-70b' if available on your account

const LANGUAGE_NAMES = {
  tamil: 'Tamil', english: 'English', telugu: 'Telugu',
  kannada: 'Kannada', malayalam: 'Malayalam', hindi: 'Hindi', both: 'Tamil and English',
};

const detectDocumentType = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('lease') || lower.includes('rent') || lower.includes('tenant') || lower.includes('landlord')) {
    return 'rental_agreement';
  }
  if (lower.includes('employment') || lower.includes('salary') || lower.includes('designation') || lower.includes('offer letter')) {
    return 'job_offer';
  }
  if (lower.includes('court') || lower.includes('summons') || lower.includes('petition') || lower.includes('notice under')) {
    return 'court_notice';
  }
  return 'other';
};

const cleanJSON = (text) => {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
};

const analyzeDocument = async (text, language = 'tamil') => {
  const docType = detectDocumentType(text);
  const langName = LANGUAGE_NAMES[language] || 'Tamil';

  const systemPrompt = `You are an expert Indian legal assistant specializing in document analysis under Indian law (Transfer of Property Act, Indian Contract Act, Industrial Disputes Act, Labour Laws, Tamil Nadu Rent Control Act, Code of Civil Procedure).

Analyze the given document and identify the document type, overall risk level, and any unfair or risky clauses.

CRITICAL RULES:
- Respond ONLY with valid JSON. No markdown, no explanations, no preamble.
- Use natural, conversational ${langName} for all translated fields - not formal or archaic.
- Be specific about WHY a clause is risky, citing relevant Indian law where applicable.
- overallRisk must be exactly one of: "high", "medium", "low", "safe"
- risk field in redFlags must be exactly one of: "high", "medium", "low"

Respond with this EXACT JSON structure:
{
  "documentType": "rental_agreement|job_offer|court_notice|other",
  "overallRisk": "high|medium|low|safe",
  "jurisdiction": "state name if identifiable, else null",
  "summary": "3-4 sentence plain English summary",
  "summary_tamil": "same summary in natural ${langName}",
  "summaryPoints": [
    {"category": "Financial|Rights|Obligations|Duration|Termination|Dispute|Notice", "point": "explanation in English", "point_tamil": "explanation in ${langName}"}
  ],
  "redFlags": [
    {"clause": "short clause name", "risk": "high|medium|low", "explanation": "why this is risky in English", "explanation_tamil": "why this is risky in ${langName}", "originalText": "excerpt from document"}
  ],
  "keyParties": [{"role": "role name", "name": "name or null"}],
  "importantDates": [{"label": "date label", "date": "date value"}],
  "financialTerms": [{"label": "term label", "amount": "amount value"}]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Document type hint: ${docType}\n\nDocument text:\n${text.slice(0, 12000)}` },
      ],
    });

    const raw = completion.choices[0].message.content;
    const analysis = JSON.parse(cleanJSON(raw));
    return analysis;
  } catch (err) {
    logger.error('AI analysis failed:', err.message);
    throw new Error('AI analysis failed. Please try again in a moment.');
  }
};

const chatWithDocument = async (question, analysis, language = 'tamil') => {
  const langName = LANGUAGE_NAMES[language] || 'Tamil';

  const systemPrompt = `You are an Indian legal expert assistant helping someone understand their document.
Here is the structured analysis of their document:
${JSON.stringify(analysis)}

Answer the user's question based on this analysis. Be specific and practical.
Respond ONLY with valid JSON: {"answer": "English answer", "answer_tamil": "${langName} answer"}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });
    return JSON.parse(cleanJSON(completion.choices[0].message.content));
  } catch (err) {
    logger.error('Chat failed:', err.message);
    throw new Error('Could not process your question. Please try again.');
  }
};

const compareDocuments = async (originalAnalysis, newDocumentText) => {
  const systemPrompt = `You are an Indian legal expert. Compare the original document analysis with a new version of the document.
Original analysis: ${JSON.stringify(originalAnalysis)}

Identify what changed - additions, removals, modifications. Give a verdict.
Respond ONLY with valid JSON:
{
  "verdict": "better|worse|similar",
  "summary": "English summary of changes",
  "summary_tamil": "Tamil summary of changes",
  "additions": ["list of new clauses"],
  "removals": ["list of removed clauses"],
  "modifications": ["list of changed terms"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `New document text:\n${newDocumentText.slice(0, 10000)}` },
      ],
    });
    return JSON.parse(cleanJSON(completion.choices[0].message.content));
  } catch (err) {
    logger.error('Compare failed:', err.message);
    throw new Error('Comparison failed. Please try again.');
  }
};

const generateNegotiationTips = async (analysis) => {
  const systemPrompt = `You are an Indian legal negotiation coach. For each high or medium risk red flag in this analysis, generate practical negotiation advice.
Analysis: ${JSON.stringify(analysis)}

Respond ONLY with valid JSON:
{"tips": [{"flagClause": "clause name", "whatToSay": "exact words to say in English", "whatToSay_tamil": "exact words in Tamil", "suggestedReplacement": "suggested fair clause text", "likelihood": "high|medium|low"}]}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2048,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate negotiation tips.' }],
    });
    return JSON.parse(cleanJSON(completion.choices[0].message.content));
  } catch (err) {
    logger.error('Negotiation tips failed:', err.message);
    throw new Error('Could not generate negotiation tips.');
  }
};

const generateDocument = async (templateId, formData) => {
  const templates = {
    rental: 'a fair, balanced Rental Agreement under Tamil Nadu Rent Control Act with equal rights for landlord and tenant',
    job_offer: 'a fair, balanced Job Offer Letter compliant with Indian Labour Laws',
  };

  const systemPrompt = `You are an Indian legal document drafter. Generate ${templates[templateId] || 'a fair legal document'} using the provided details. Make it professional, complete, and legally sound. Output the full document text only, no commentary.`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Details: ${JSON.stringify(formData)}` },
      ],
    });
    return completion.choices[0].message.content;
  } catch (err) {
    logger.error('Document generation failed:', err.message);
    throw new Error('Document generation failed. Please try again.');
  }
};

module.exports = {
  detectDocumentType,
  analyzeDocument,
  chatWithDocument,
  compareDocuments,
  generateNegotiationTips,
  generateDocument,
};
