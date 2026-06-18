# NyayaAI — Legal Clarity for Every Indian

AI-powered legal document analyzer for Indian users in Tamil, Telugu, Kannada, Malayalam, Hindi & English.

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your GROQ_API_KEY (free at console.groq.com)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Add Firebase + Razorpay config (see SETUP_GUIDE.md)
npm run dev
```

Open http://localhost:3000

## Full Setup Guide

See `SETUP_GUIDE.md` for complete Firebase Authentication and Razorpay Payment setup instructions.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS, Firebase Auth, Tesseract.js, jsPDF
- Backend: Node.js, Express, Groq AI (Llama 3.3 70B), MongoDB (optional), Razorpay

## Features

17+ features including PDF/image analysis, red flag detection, Tamil support, negotiation coach, document generation, voice input/output, risk scoring, contract reminders, and more.

## License

MIT
