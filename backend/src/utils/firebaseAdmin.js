const admin = require('firebase-admin');
const logger = require('../utils/logger');

let initialized = false;

/**
 * Initializes Firebase Admin SDK using a service account.
 *
 * Setup:
 * 1. Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
 * 2. Save the downloaded JSON file as `backend/serviceAccountKey.json` (gitignored)
 * 3. OR set FIREBASE_SERVICE_ACCOUNT env var to the full JSON string (recommended for hosting)
 */
const initFirebaseAdmin = () => {
  if (initialized) return;

  try {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Production: full JSON passed as env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Local dev: file on disk
      const serviceAccount = require('../../serviceAccountKey.json');
      credential = admin.credential.cert(serviceAccount);
    }

    admin.initializeApp({ credential });
    initialized = true;
    logger.info('✅ Firebase Admin initialized');
  } catch (err) {
    logger.warn('⚠️  Firebase Admin NOT initialized — auth-protected routes will fail.', err.message);
    logger.warn('⚠️  Add backend/serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env var. See SETUP_GUIDE.md');
  }
};

const getAdmin = () => {
  if (!initialized) initFirebaseAdmin();
  return admin;
};

const getFirestore = () => {
  if (!initialized) initFirebaseAdmin();
  return admin.firestore();
};

const getAuth = () => {
  if (!initialized) initFirebaseAdmin();
  return admin.auth();
};

module.exports = { initFirebaseAdmin, getAdmin, getFirestore, getAuth, isInitialized: () => initialized };
