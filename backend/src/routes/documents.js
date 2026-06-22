const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { extractTextFromPDF, validateText } = require('../services/pdfService');
const { analyzeDocument } = require('../services/aiService');
const logger = require('../utils/logger');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { verifyToken, checkUsageLimit, incrementUsageAfterSuccess } = require('../middleware/auth');

let Document;
try { Document = require('../models/Document'); } catch {}

// In-memory fallback store
const memoryStore = new Map();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

router.post('/upload', uploadLimiter, verifyToken, checkUsageLimit, upload.single('document'), async (req, res, next) => {
  const start = Date.now();
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    logger.info(`Processing upload: ${req.file.originalname} (${req.file.size} bytes) for user ${req.uid}`);

    const { text, pageCount } = await extractTextFromPDF(req.file.buffer);
    const validText = validateText(text);
    const language = req.body.language || 'tamil';

    const analysis = await analyzeDocument(validText, language);
    const documentId = uuidv4();
    const processingTime = Date.now() - start;

    logger.info(`Analysis completed in ${processingTime}ms, risk: ${analysis.overallRisk}`);

    // Only now that analysis succeeded do we spend the user's free/paid credit
    await incrementUsageAfterSuccess(req);

    // Try Mongo, fallback to memory
    try {
      if (Document && require('mongoose').connection.readyState === 1) {
        await Document.create({ documentId, fileName: req.file.originalname, documentType: analysis.documentType, analysis });
      } else {
        memoryStore.set(documentId, { fileName: req.file.originalname, analysis, createdAt: Date.now() });
      }
    } catch {
      memoryStore.set(documentId, { fileName: req.file.originalname, analysis, createdAt: Date.now() });
    }

    res.json({
      success: true,
      documentId,
      fileName: req.file.originalname,
      pageCount,
      processingTime,
      analysis,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (Document && require('mongoose').connection.readyState === 1) {
      const doc = await Document.findOne({ documentId: id });
      if (doc) return res.json(doc);
    }
  } catch {}
  const doc = memoryStore.get(id);
  if (!doc) return res.status(404).json({ error: 'Document not found or expired' });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (Document && require('mongoose').connection.readyState === 1) {
      await Document.deleteOne({ documentId: id });
    }
  } catch {}
  memoryStore.delete(id);
  res.json({ success: true });
});

module.exports = router;
