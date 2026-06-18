const express = require('express');
const router = express.Router();
const { analyzeDocument, chatWithDocument, compareDocuments, generateNegotiationTips } = require('../services/aiService');
const { validateText } = require('../services/pdfService');
const logger = require('../utils/logger');

router.post('/text', async (req, res, next) => {
  const start = Date.now();
  try {
    const { text, language = 'tamil' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const validText = validateText(text);
    const analysis = await analyzeDocument(validText, language);
    logger.info(`Analysis completed in ${Date.now() - start}ms, risk: ${analysis.overallRisk}`);

    res.json({ success: true, analysis, processingTime: Date.now() - start });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { question, analysis, language = 'tamil' } = req.body;
    if (!question || !analysis) return res.status(400).json({ error: 'question and analysis are required' });

    const result = await chatWithDocument(question, analysis, language);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/compare', async (req, res, next) => {
  try {
    const { originalAnalysis, newDocumentText } = req.body;
    if (!originalAnalysis || !newDocumentText) {
      return res.status(400).json({ error: 'originalAnalysis and newDocumentText are required' });
    }
    const result = await compareDocuments(originalAnalysis, newDocumentText);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/negotiate', async (req, res, next) => {
  try {
    const { analysis } = req.body;
    if (!analysis) return res.status(400).json({ error: 'analysis is required' });
    const result = await generateNegotiationTips(analysis);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/sample', (req, res) => {
  res.json({
    documentType: 'rental_agreement',
    overallRisk: 'high',
    jurisdiction: 'Tamil Nadu',
    summary: 'This is a 11-month rental agreement for a 2BHK apartment in Chennai. The agreement contains several clauses that favor the landlord disproportionately, including an arbitrary entry clause and unfair security deposit terms.',
    summary_tamil: 'இது சென்னையில் உள்ள 2BHK அபார்ட்மெண்டிற்கான 11 மாத வாடகை ஒப்பந்தம். இந்த ஒப்பந்தத்தில் வீட்டு உரிமையாளருக்கு சாதகமான பல விதிகள் உள்ளன, இதில் தன்னிச்சையான நுழைவு விதி மற்றும் நியாயமற்ற பாதுகாப்பு வைப்பு நிபந்தனைகள் அடங்கும்.',
    summaryPoints: [
      { category: 'Financial', point: 'Monthly rent is ₹15,000 with a security deposit of ₹45,000 (3 months rent)', point_tamil: 'மாத வாடகை ₹15,000 மற்றும் பாதுகாப்பு வைப்பு ₹45,000 (3 மாத வாடகை)' },
      { category: 'Duration', point: 'The agreement is for 11 months starting from the move-in date', point_tamil: 'ஒப்பந்தம் குடியேறும் தேதியிலிருந்து 11 மாதங்களுக்கு' },
      { category: 'Termination', point: 'Only the landlord can terminate with 30 days notice; tenant must give 60 days notice', point_tamil: 'வீட்டு உரிமையாளர் மட்டுமே 30 நாள் அறிவிப்புடன் ரத்து செய்யலாம்; குத்தகைதாரர் 60 நாள் அறிவிப்பு கொடுக்க வேண்டும்' },
    ],
    redFlags: [
      { clause: 'Arbitrary Entry Clause', risk: 'high', explanation: 'The landlord can enter the property at any time without prior notice, which violates the tenant\'s right to peaceful enjoyment of the property.', explanation_tamil: 'வீட்டு உரிமையாளர் முன் அறிவிப்பு இல்லாமல் எந்த நேரத்திலும் சொத்தில் நுழையலாம்.', originalText: 'Landlord reserves the right to enter the premises at any time for inspection purposes.' },
      { clause: 'Unequal Notice Period', risk: 'medium', explanation: 'The notice period required for termination is unequal - 30 days for landlord but 60 days for tenant, which is unfair.', explanation_tamil: 'ரத்து செய்வதற்கான அறிவிப்பு காலம் சமமற்றது.', originalText: 'Tenant must provide 60 days written notice; Landlord may terminate with 30 days notice.' },
      { clause: 'Security Deposit Forfeiture', risk: 'high', explanation: 'The landlord can deduct any amount from the deposit without providing receipts or proof of damage.', explanation_tamil: 'வீட்டு உரிமையாளர் ஆதாரம் இல்லாமல் வைப்புத் தொகையிலிருந்து எந்த தொகையையும் கழிக்கலாம்.', originalText: 'Landlord may deduct any amount deemed necessary for damages from the security deposit.' },
    ],
    keyParties: [
      { role: 'Landlord', name: 'Rajesh Kumar' },
      { role: 'Tenant', name: 'Priya Devi' },
    ],
    importantDates: [
      { label: 'Agreement Start Date', date: '01 June 2025' },
      { label: 'Agreement End Date', date: '30 April 2026' },
    ],
    financialTerms: [
      { label: 'Monthly Rent', amount: '₹15,000' },
      { label: 'Security Deposit', amount: '₹45,000' },
      { label: 'Maintenance Charges', amount: '₹1,500/month' },
    ],
  });
});

module.exports = router;
