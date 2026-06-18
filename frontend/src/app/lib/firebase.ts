import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

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
  uid: string; email: string; name: string; photoURL: string;
  plan: 'free' | 'pro'; analysisCount: number; monthYear: string;
  totalAnalyses: number; paidCredits: number; createdAt: string; lastActive: string;
}

export const getOrCreateUserDoc = async (firebaseUser: FirebaseUser): Promise<UserDoc> => {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  const currentMonthYear = new Date().toISOString().slice(0, 7);
  if (!snap.exists()) {
    const newUser: UserDoc = { uid: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User', photoURL: firebaseUser.photoURL || '', plan: 'free', analysisCount: 0, monthYear: currentMonthYear, totalAnalyses: 0, paidCredits: 0, createdAt: new Date().toISOString(), lastActive: new Date().toISOString() };
    await setDoc(ref, newUser);
    return newUser;
  }
  const data = snap.data() as UserDoc;
  if (data.monthYear !== currentMonthYear) {
    await updateDoc(ref, { analysisCount: 0, monthYear: currentMonthYear, lastActive: new Date().toISOString() });
    return { ...data, analysisCount: 0, monthYear: currentMonthYear };
  }
  return data;
};

export const incrementAnalysisCount = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { analysisCount: increment(1), totalAnalyses: increment(1), lastActive: new Date().toISOString() });
};

export const addPaidCredit = async (uid: string): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), { paidCredits: increment(1), lastActive: new Date().toISOString() });
};

export const canUserAnalyze = (userDoc: UserDoc): boolean => {
  return userDoc.plan === 'pro' || userDoc.analysisCount < FREE_LIMIT || (userDoc.paidCredits || 0) > 0;
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => { const r = await signInWithPopup(auth, googleProvider); return r.user; };
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => { const r = await signInWithEmailAndPassword(auth, email, password); return r.user; };
export const signUpWithEmail = async (email: string, password: string, name: string): Promise<FirebaseUser> => { const r = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(r.user, { displayName: name }); return r.user; };
export const signOutUser = async (): Promise<void> => { await signOut(auth); };
export { onAuthStateChanged };
export type { FirebaseUser };
