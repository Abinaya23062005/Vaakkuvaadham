const express = require('express');
const router = express.Router();
const { generateDocument } = require('../services/aiService');
const logger = require('../utils/logger');

router.post('/document', async (req, res, next) => {
  const start = Date.now();
  try {
    const { templateId, formData } = req.body;
    if (!templateId || !formData) {
      return res.status(400).json({ error: 'templateId and formData are required' });
    }

    logger.info(`Generating ${templateId === 'rental' ? 'Rental Agreement' : 'Job Offer'}...`);
    const document = await generateDocument(templateId, formData);

    res.json({
      success: true,
      document,
      templateName: templateId === 'rental' ? 'Rental Agreement' : 'Job Offer Letter',
      processingTime: Date.now() - start,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
