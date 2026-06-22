# NyayaAI — Authentication & Payment Setup Guide

## Overview

This guide sets up:
1. **Firebase** — Real Google Sign-In + Email authentication + user database
2. **Razorpay** — ₹49 payment after 10 free analyses
3. **Usage Tracking** — Per-email monthly limits

---

## Step 1 — Firebase Setup (Free, 10 minutes)

### 1.1 Create Firebase Project
1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
2. Click **"Add project"** → Name: `NyayaAI`
3. Disable Google Analytics (optional) → **Create project**

### 1.2 Enable Authentication
1. Left sidebar → **Authentication** → **Get Started**
2. **Sign-in method** tab → Enable **Google** → Add your support email → Save
3. **Sign-in method** tab → Enable **Email/Password** → Save
4. **Settings** tab → **Authorized domains** → Add `localhost`

### 1.3 Create Firestore Database
1. Left sidebar → **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select region: **asia-south1** (Mumbai — closest to Tamil Nadu)
4. Click **Done**

### 1.4 Get Firebase Config
1. Left sidebar → ⚙️ **Project Settings** → **General**
2. Scroll down to **"Your apps"** → Click **Web** icon (`</>`)
3. Register app name: `nyayaai-web` → **Register app**
4. Copy the `firebaseConfig` object shown

### 1.5 Deploy Firestore Security Rules — DO NOT SKIP THIS

⚠️ **By default, Firestore "test mode" allows ANY signed-in user to read or write ANY other user's document.** That means without this step, any user could open the browser console and rewrite their own `analysisCount` to `0`, or even read other people's emails and usage data. This step closes that hole.

The rules file is already in the project root: `firestore.rules`. It does two things:
1. Restricts each user to only reading/writing **their own** document
2. **Blocks the client from ever changing `analysisCount`, `paidCredits`, or `plan` directly** — those fields can only change via the backend's Firebase Admin SDK (which bypasses client rules), so the usage-limit logic in `backend/src/middleware/auth.js` is the only thing that can grant more analyses.

**Option A — Firebase Console (no CLI needed, 2 minutes):**
1. Go to **Firestore Database** → **Rules** tab
2. Open `firestore.rules` from this project, copy its full contents
3. Paste into the Console editor, replacing everything there
4. Click **Publish**

**Option B — Firebase CLI (if you have it installed):**
```powershell
npm install -g firebase-tools
firebase login
firebase init firestore   # select your existing project, keep firestore.rules path as-is
firebase deploy --only firestore:rules
```

**Verify it worked:** In Firestore Console → Rules tab, you should see the rules with the comment about `analysisCount` staying unchanged. If a teammate or you later changes the rules back to test-mode (`allow read, write: if true`), re-paste from `firestore.rules`.

---

## Step 1.6 — Firebase Admin SDK (Backend) — Required for usage limits to actually work

The frontend (`firebase.ts`) only verifies *who* a user is. The **backend** needs its own Firebase credentials to verify that identity and check the real analysis count in Firestore — this is what makes the 10-free-then-₹49 limit unbypassable.

1. Firebase Console → ⚙️ **Project Settings** → **Service Accounts** tab
2. Click **Generate new private key** → confirm → a JSON file downloads
3. Rename it to `serviceAccountKey.json`
4. Move it into the `backend/` folder, next to `package.json`

```
backend/
├── package.json
├── serviceAccountKey.json   <- put it here
├── src/
```

This file is already excluded in `.gitignore` — **never commit it**, since it grants full admin access to your Firebase project.

If you deploy the backend to a host like Render or Railway (which won't have this file on disk), open the JSON file, copy its entire contents as one line, and paste it into the `FIREBASE_SERVICE_ACCOUNT` environment variable in your host's dashboard instead.

---

## Step 2 — Razorpay Setup (Free, 5 minutes)

### 2.1 Create Account
1. Go to **[dashboard.razorpay.com](https://dashboard.razorpay.com)**
2. Sign up with your mobile number
3. Complete basic KYC (PAN card required for live mode)

### 2.2 Get API Keys
1. Left sidebar → **Settings** → **API Keys**
2. Click **Generate Test Key**
3. Copy **Key ID** (starts with `rzp_test_`) and **Key Secret**
4. Keep the secret safe — never put it in frontend code

### 2.3 Install Razorpay in Backend
```powershell
cd backend
npm install razorpay
```

---

## Step 3 — Add Environment Variables

### Frontend — create `.env.local` in `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase (from Step 1.4)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nyayaai-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nyayaai-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nyayaai-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Razorpay (from Step 2.2)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
```

### Backend — add to `.env` file:
```env
# Razorpay (from Step 2.2)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET
```

---

## Step 4 — Copy New Files

### Frontend files to copy:
```
src/app/lib/firebase.ts          → frontend/src/app/lib/firebase.ts
src/app/components/AuthModal.tsx → frontend/src/app/components/AuthModal.tsx
src/app/components/PaymentGate.tsx → frontend/src/app/components/PaymentGate.tsx
src/app/components/UsageIndicator.tsx → frontend/src/app/components/UsageIndicator.tsx
src/app/page.tsx                 → frontend/src/app/page.tsx
```

### Backend files to copy:
```
backend/src/routes/payment.js → backend/src/routes/payment.js
```

### Register payment route in backend/src/server.js:
Add these 2 lines to server.js:
```javascript
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);
```

---

## Step 5 — Install Dependencies

### Frontend:
```powershell
cd frontend
npm install firebase
```

### Backend:
```powershell
cd backend
npm install razorpay
```

---

## Step 6 — Test Everything

### Test Google Sign-In:
1. Start both servers (`npm run dev`)
2. Open `http://localhost:3000`
3. Click **Sign In** → **Continue with Google**
4. A Google popup should appear
5. Select your Google account
6. You should be logged in with your name in navbar

### Test Email Sign-In:
1. Click **Sign In** → switch to **Sign up free**
2. Enter name, email, password
3. Click **Create Free Account**
4. Should log in successfully

### Test Usage Limit:
1. Sign in with an account
2. Analyze 10 documents
3. On the 11th, PaymentGate should appear

### Test Payment (Test mode):
Use these test card details in Razorpay:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

---

## How Usage Tracking Works

```
User signs in
      ↓
Firebase stores user doc:
  { analysisCount: 0, monthYear: "2025-06" }
      ↓
Every analysis → analysisCount + 1
      ↓
analysisCount >= 10?
  YES → Show PaymentGate (₹49)
  NO  → Allow analysis
      ↓
1st of next month → analysisCount resets to 0
```

---

## Firestore Data Structure

Each user document in `users/{uid}`:
```json
{
  "uid": "firebase_user_id",
  "email": "user@gmail.com",
  "name": "Priya Devi",
  "photoURL": "https://...",
  "plan": "free",
  "analysisCount": 7,
  "monthYear": "2025-06",
  "totalAnalyses": 23,
  "paidCredits": 0,
  "createdAt": "2025-06-01T...",
  "lastActive": "2025-06-05T..."
}
```

---

## Revenue Tracking

View all users and payments in:
- **Firebase Console** → Firestore → `users` collection
- **Razorpay Dashboard** → Transactions

---

## Common Issues

| Issue | Fix |
|---|---|
| "Popup blocked" | Allow popups in Chrome: Settings → Privacy → Popups → Allow localhost |
| "Firebase not configured" | Check `.env.local` has all NEXT_PUBLIC_FIREBASE_ variables |
| "auth/unauthorized-domain" | Add `localhost` in Firebase Console → Authentication → Settings → Authorized domains |
| Payment not working | Check RAZORPAY_KEY_ID in backend `.env` matches frontend `.env.local` |
| Firestore permission denied | Check Firestore security rules allow authenticated users |
| "Please sign in to analyze documents" even though signed in | Backend can't verify your ID token — check `backend/serviceAccountKey.json` exists (see Step 1.6) |
| Analysis succeeds but count doesn't go up | Firebase Admin not initialized on backend — check server logs for "Firebase Admin NOT initialized" warning |

---

## Security & Reliability Fixes (v2.1)

This version closes five gaps found during a security/reliability review. If you're upgrading from an earlier version, here's what changed and why:

### 1. Usage limits are now enforced server-side
**Before:** The 10-free-analyses-per-month count lived only in `localStorage` and the frontend's copy of the Firestore doc. Anyone could open DevTools → Application → Local Storage → edit `analysisCount` back to 0, or just call the Firestore SDK directly from the browser console to reset it.

**Now:** Every analysis request (`POST /api/documents/upload`, `POST /api/analysis/text`) must include a Firebase ID token. The backend (`middleware/auth.js`) verifies that token using Firebase Admin SDK, reads the user's `analysisCount` directly from Firestore, and only proceeds if the limit isn't reached. The count is only incremented **after** the AI call succeeds, so a failed analysis never costs the user a credit. The client-side check in `page.tsx` still runs first — it's just a fast UX hint to show the sign-in/payment modal early, not the actual gate.

**Setup required:** You must add `backend/serviceAccountKey.json` for this to work — see Step 1.6 above. Without it, the backend logs a warning and allows all requests through (so local development isn't blocked), but this means **the limit check is effectively disabled** until you add the service account file.

### 2. Firestore security rules now block direct tampering
**Before:** The example rules in this guide allowed any signed-in user to read/write their *own* document with no restrictions — including the `analysisCount` and `paidCredits` fields that gate payment.

**Now:** `firestore.rules` (in the project root) explicitly blocks the client from changing `analysisCount`, `paidCredits`, or `plan` on update — those fields can only change via the backend's Admin SDK, which bypasses these rules entirely. You must deploy this file (see Step 1.5) for the protection to be active; just having the file in the repo does nothing until it's published in Firebase Console.

### 3. Scanned/image-based PDFs are now detected and redirected
**Before:** Uploading a scanned PDF (no text layer) would either error out generically or, worse, send a handful of garbage characters to the AI, which would return a confident-sounding but meaningless analysis.

**Now:** `pdfService.js` checks both total extracted text length AND average characters-per-page. If a PDF looks like a scan, the backend returns a `422` with `code: 'OCR_NEEDED'` *before* ever calling the AI — so no usage credit is spent. The frontend catches this and automatically switches the user into the Scan Image (OCR) tab with an explanatory banner, instead of showing a dead-end error screen.

### 4. A crash in one part of the UI no longer takes down the whole app
**Before:** The Groq AI occasionally returns analysis JSON with a missing or differently-shaped field (e.g. `redFlags` is `null` instead of `[]`). Code like `analysis.redFlags.map(...)` would throw, and because React has no default recovery, the *entire* page — navbar, sign-in button, everything — would white-screen.

**Now:** `components/ErrorBoundary.tsx` wraps the whole app (in `layout.tsx`) as a last-resort safety net, and also wraps each individual results tab (in `page.tsx`) so a crash in, say, the Negotiation Coach tab shows a small "this section couldn't load, retry" message inline — the rest of the analysis (Summary, Red Flags, etc.) keeps working normally.

### 5. Forgot-password flow
**Before:** Users could sign up and sign in with email/password, but had no way to recover a forgotten password — they'd be permanently locked out of that account.

**Now:** A "Forgot password?" link on the sign-in form switches `AuthModal` into a `reset` mode that calls Firebase's built-in `sendPasswordResetEmail`. The success message is intentionally generic ("if an account exists for this email...") regardless of whether the email is actually registered, so the flow can't be used to check which emails have NyayaAI accounts.

