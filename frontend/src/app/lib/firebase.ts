import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const FREE_LIMIT = 10;
export const PAYMENT_AMOUNT = 49;

export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  photoURL: string;
  plan: 'free' | 'pro';
  analysisCount: number;
  monthYear: string;
  totalAnalyses: number;
  paidCredits: number;
  createdAt: string;
  lastActive: string;
}

// Build a UserDoc from a Firebase user when Firestore is unavailable
const buildLocalUserDoc = (firebaseUser: FirebaseUser): UserDoc => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  photoURL: firebaseUser.photoURL || '',
  plan: 'free',
  analysisCount: 0,
  monthYear: new Date().toISOString().slice(0, 7),
  totalAnalyses: 0,
  paidCredits: 0,
  createdAt: new Date().toISOString(),
  lastActive: new Date().toISOString(),
});

// Get or create user doc in Firestore.
// Falls back gracefully if Firestore is not set up yet (no billing/database).
export const getOrCreateUserDoc = async (firebaseUser: FirebaseUser): Promise<UserDoc> => {
  try {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    if (!snap.exists()) {
      const newUser: UserDoc = buildLocalUserDoc(firebaseUser);
      newUser.monthYear = currentMonthYear;
      try {
        await setDoc(ref, newUser);
      } catch (writeErr) {
        // Firestore write failed (no database yet) — return the local object anyway
        // so the user is signed in and can use the app
        console.warn('Firestore not available — running without usage tracking:', writeErr);
      }
      return newUser;
    }

    const data = snap.data() as UserDoc;

    // Reset monthly count if new month
    if (data.monthYear !== currentMonthYear) {
      try {
        await updateDoc(ref, {
          analysisCount: 0,
          monthYear: currentMonthYear,
          lastActive: new Date().toISOString(),
        });
      } catch {}
      return { ...data, analysisCount: 0, monthYear: currentMonthYear };
    }

    return data;
  } catch (err: any) {
    // Firestore doesn't exist yet or permissions are not set up.
    // Return a local user object so sign-in still works.
    console.warn('Firestore unavailable — using local user data. Create a Firestore database to enable usage tracking.');
    return buildLocalUserDoc(firebaseUser);
  }
};

// Increment analysis count in Firestore — silently skipped if unavailable
export const incrementAnalysisCount = async (uid: string): Promise<void> => {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      analysisCount: increment(1),
      totalAnalyses: increment(1),
      lastActive: new Date().toISOString(),
    });
  } catch {
    // Firestore not available — count tracked locally only
  }
};

// Add a paid credit — silently skipped if Firestore unavailable
export const addPaidCredit = async (uid: string): Promise<void> => {
  try {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {
      paidCredits: increment(1),
      lastActive: new Date().toISOString(),
    });
  } catch {
    // Firestore not available
  }
};

export const canUserAnalyze = (userDoc: UserDoc): boolean => {
  return userDoc.plan === 'pro' ||
    userDoc.analysisCount < FREE_LIMIT ||
    (userDoc.paidCredits || 0) > 0;
};

// Auth functions
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

export const signUpWithEmail = async (email: string, password: string, name: string): Promise<FirebaseUser> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  return result.user;
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export { onAuthStateChanged };
export type { FirebaseUser };