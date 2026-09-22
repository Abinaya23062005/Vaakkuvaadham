const { getAuth, getFirestore, isInitialized } = require('../utils/firebaseAdmin');
const logger = require('../utils/logger');

const FREE_LIMIT = 10;

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * Attaches req.uid and req.userEmail on success.
 * Does NOT block the request if no token is present (guest mode allowed
 * for the 3-free-without-login flow) — use requireAuth() for hard auth.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.uid = null;
    return next();
  }

  if (!isInitialized()) {
    logger.warn('Firebase Admin not initialized — skipping token verification');
    req.uid = null;
    return next();
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    logger.warn('Invalid auth token:', err.message);
    req.uid = null;
    next();
  }
};

/**
 * Hard requirement — rejects the request if there's no valid, verified user.
 */
const requireAuth = (req, res, next) => {
  if (!req.uid) {
    return res.status(401).json({ error: 'Please sign in to continue.', code: 'AUTH_REQUIRED' });
  }
  next();
};

/**
 * THE CRITICAL FIX: checks the user's analysis count directly in Firestore
 * (server-side, source of truth) rather than trusting any value the client sends.
 *
 * - If user has plan === 'pro' -> always allowed
 * - If user has paidCredits > 0 -> allowed, and this middleware consumes one credit
 * - If analysisCount < FREE_LIMIT (reset monthly) -> allowed
 * - Otherwise -> 402 Payment Required
 *
 * On success, attaches req.usageInfo and calls next(). The actual increment
 * of analysisCount happens in incrementUsageAfterSuccess() AFTER the AI call
 * succeeds, so a failed analysis never costs the user a credit.
 */
const checkUsageLimit = async (req, res, next) => {
  if (!isInitialized()) {
    logger.warn('Firebase Admin not initialized — skipping auth check');
    req.usageInfo = { bypass: true };
    return next();
  }

  if (!req.uid) {
    return res.status(401).json({ error: 'Please sign in to analyze documents.', code: 'AUTH_REQUIRED' });
  }


  try {
    const db = getFirestore();
    const ref = db.collection('users').doc(req.uid);
    const snap = await ref.get();
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    if (!snap.exists) {
      // First-ever request from this uid before client created the doc — create it now
      await ref.set({
        uid: req.uid,
        email: req.userEmail || '',
        plan: 'free',
        analysisCount: 0,
        monthYear: currentMonthYear,
        totalAnalyses: 0,
        paidCredits: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      req.usageInfo = { uid: req.uid, willUsePaidCredit: false };
      return next();
    }

    const data = snap.data();
    const needsMonthlyReset = data.monthYear !== currentMonthYear;
    const effectiveCount = needsMonthlyReset ? 0 : (data.analysisCount || 0);
    const paidCredits = data.paidCredits || 0;
    const plan = data.plan || 'free';

    if (plan === 'pro') {
      req.usageInfo = { uid: req.uid, willUsePaidCredit: false, needsMonthlyReset, currentMonthYear };
      return next();
    }

    if (effectiveCount < FREE_LIMIT) {
      req.usageInfo = { uid: req.uid, willUsePaidCredit: false, needsMonthlyReset, currentMonthYear };
      return next();
    }

    if (paidCredits > 0) {
      req.usageInfo = { uid: req.uid, willUsePaidCredit: true, needsMonthlyReset, currentMonthYear };
      return next();
    }

    // Limit reached and no paid credits — block with 402
    logger.info(`Usage limit reached for ${req.uid} (${effectiveCount}/${FREE_LIMIT}, credits: ${paidCredits})`);
    return res.status(402).json({
      error: 'Free analysis limit reached for this month. Please pay ₹49 to continue.',
      code: 'LIMIT_REACHED',
      analysisCount: effectiveCount,
      freeLimit: FREE_LIMIT,
    });
  } catch (err) {
    logger.error('Usage limit check failed:', err.message);
    return res.status(500).json({ error: 'Could not verify usage limit. Please try again.' });
  }
};

/**
 * Called AFTER a successful AI analysis to actually record the usage.
 * Separated from checkUsageLimit so failed/errored analyses don't cost a credit.
 */
const incrementUsageAfterSuccess = async (req) => {
  if (!req.usageInfo || req.usageInfo.bypass || !req.uid) return;
  if (!isInitialized()) return;

  try {
    const db = getFirestore();
    const ref = db.collection('users').doc(req.uid);
    const { willUsePaidCredit, needsMonthlyReset, currentMonthYear } = req.usageInfo;

    const updates = {
      lastActive: new Date().toISOString(),
      totalAnalyses: (await ref.get()).data()?.totalAnalyses
        ? require('firebase-admin').firestore.FieldValue.increment(1)
        : 1,
    };

    if (needsMonthlyReset) {
      updates.monthYear = currentMonthYear;
      updates.analysisCount = 1; // this analysis is the first of the new month
    } else {
      updates.analysisCount = require('firebase-admin').firestore.FieldValue.increment(1);
    }

    if (willUsePaidCredit) {
      updates.paidCredits = require('firebase-admin').firestore.FieldValue.increment(-1);
    }

    await ref.update(updates);
  } catch (err) {
    logger.error('Failed to increment usage count:', err.message);
    // Do not throw — the analysis already succeeded and was returned to the user.
    // Worst case here is one under-counted usage, which is the safe direction to fail in.
  }
};

module.exports = { verifyToken, requireAuth, checkUsageLimit, incrementUsageAfterSuccess, FREE_LIMIT };
