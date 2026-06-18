const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  documentType: { type: String, default: 'other' },
  analysis: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24hr TTL
});

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
