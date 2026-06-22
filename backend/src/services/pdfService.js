const pdfParse = require('pdf-parse');
const logger = require('../utils/logger');

// Custom error type so the route layer (and ultimately the frontend) can
// distinguish "this PDF has no text layer, try OCR instead" from a genuine
// parsing failure (corrupted/password-protected file). Previously both
// cases threw a generic Error and the user just saw a dead-end message.
class OCRNeededError extends Error {
  constructor(message, pageCount) {
    super(message);
    this.code = 'OCR_NEEDED';
    this.pageCount = pageCount;
  }
}

// Heuristic: a genuine text-layer PDF averages well over 100 characters
// per page for any real legal document (even a short one). Scanned PDFs
// often still extract a handful of stray characters (form field artifacts,
// page numbers inserted by the scanner) without ever containing readable
// body text, which is why a flat ">50 chars total" check (the old logic)
// let garbage through silently instead of catching it.
const MIN_CHARS_PER_PAGE = 40;
const MIN_TOTAL_CHARS = 100;

const extractTextFromPDF = async (buffer) => {
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    logger.error('PDF parsing failed:', err.message);
    throw new Error('Could not read this PDF. It may be corrupted or password protected.');
  }

  const text = data.text.trim();
  const pageCount = data.numpages || 1;
  const avgCharsPerPage = text.length / pageCount;

  if (text.length < MIN_TOTAL_CHARS || avgCharsPerPage < MIN_CHARS_PER_PAGE) {
    logger.info(`OCR needed: extracted only ${text.length} chars across ${pageCount} pages (avg ${avgCharsPerPage.toFixed(0)}/page)`);
    throw new OCRNeededError(
      'This PDF appears to be scanned or image-based — no readable text layer was found. Please use the Scan Image option instead, or try re-saving the PDF with OCR applied.',
      pageCount
    );
  }

  logger.info(`Extracted ${text.length} chars from ${pageCount} pages`);

  return { text, pageCount };
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

module.exports = { extractTextFromPDF, validateText, OCRNeededError };

