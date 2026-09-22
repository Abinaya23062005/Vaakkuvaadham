require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const requestLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const healthRoutes = require('./routes/health');
const documentRoutes = require('./routes/documents');
const analysisRoutes = require('./routes/analysis');
const generateRoutes = require('./routes/generate');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(generalLimiter);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/payment', paymentRoutes);

// Error handler (must be last)
app.use(errorHandler);

// MongoDB connection (optional)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('✅ MongoDB connected'))
    .catch((err) => logger.warn('⚠️  MongoDB connection failed — running without persistence:', err.message));
} else {
  logger.warn('⚠️  No MONGODB_URI set — running without persistence');
}

app.listen(PORT, () => {
  logger.info(`🚀 NyayaAI server running on port ${PORT}`);
});
