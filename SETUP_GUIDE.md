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

### 1.5 Add Firestore Security Rules
Go to **Firestore** → **Rules** tab → Replace with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Click **Publish**

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
