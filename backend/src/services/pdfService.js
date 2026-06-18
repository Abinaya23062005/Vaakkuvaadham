const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    if (text.length < 50) {
      throw new Error('PDF appears to be empty or contains only images. Try the Scan Image feature instead.');
    }

    logger.info(`Extracted ${text.length} chars from ${data.numpages} pages`);

    return {
      text,
      pageCount: data.numpages,
    };
  } catch (err) {
    if (err.message.includes('image')) throw err;
    logger.error('PDF parsing failed:', err.message);
    throw new Error('Could not read this PDF. It may be corrupted or password protected.');
  }
};

const validateText = (text) => {
  if (!text || text.trim().length < 100) {
    throw new Error('Document text is too short. Please provide at least 100 characters.');
  }
  if (text.length > 50000) {
    return text.slice(0, 50000);
  }
  return text;
};

module.exports = { extractTextFromPDF, validateText };
