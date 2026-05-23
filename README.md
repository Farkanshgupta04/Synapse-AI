# Synapse AI — Project Overview

A full-stack Synapse AI application (MERN) with JWT + optional Google OAuth authentication and AI responses powered by Gemini.

## Summary

- Backend: Express API with JWT auth, optional Google OAuth, Gemini integration, and file upload support.
- Frontend: React + Vite + Tailwind UI; components live under `frontend/src/components/` and auth context under `frontend/src/context/`.
- Database: MongoDB (Mongoose models in `backend/model/`).
- Tests: middleware and model tests under `backend/test/`.

## Live Demo

- Project frontend (live): https://synapse-ai-ten-sable.vercel.app/

## Core Structure

- `backend/` — API server, controllers, middleware, Mongoose models, routes, uploads.
- `frontend/` — React application (Vite) with UI components, auth context, and configuration.
- `backend/test/` — unit tests for middleware and models.

## New Features

- Google OAuth sign-in and server-side ID token verification.
- Google OAuth error handling added to the errors tracker.
- Gemini model fallback and retry/backoff strategies for improved reliability.
- File upload support using Multer with uploads saved to `backend/uploads/`.
- Centralized global error handler returning consistent JSON responses.
- Deployment-ready configuration (frontend: Vercel, backend: Render).

## Outcome

- Deliverable: a runnable MERN application that enables authenticated users to interact with an AI-driven chat service, persist chat history, upload files, and deploy to production.
- Engineers can extend the app by adding models, routes, or frontend features; product teams can integrate the chat API into web or mobile clients.

## Real-world Problem Solved

- Provides an accessible AI assistant and conversational API that organizations can use to automate customer support responses, summarize and retrieve knowledge from user inputs, and speed up common tasks (e.g., FAQ answers, content drafting, or developer assistance).
- Helps teams reduce manual response time, capture conversational context for later analysis, and prototype AI-powered features with a secure auth and deployment-ready stack.

## Updated File Structure (tree — excluding top-level .md files)

```
Synapse AI/
├─ backend/
│  ├─ config.js
│  ├─ index.js
│  ├─ package.json
│  ├─ uploads/
│  ├─ controller/
│  │  ├─ ai.controller.js
│  │  ├─ chat.controller.js
│  │  ├─ promt.controller.js
│  │  └─ user.controller.js
│  ├─ middleware/
│  │  ├─ error.middleware.js
│  │  ├─ promt.middleware.js
│  │  ├─ requestLogger.middleware.js
│  │  └─ validation.middleware.js
│  ├─ model/
│  │  ├─ chatMessage.model.js
│  │  ├─ chatSession.model.js
│  │  ├─ promt.model.js
│  │  └─ user.model.js
│  └─ routes/
│     ├─ chat.route.js
│     ├─ promt.route.js
│     └─ user.route.js
├─ frontend/
│  ├─ package.json
│  ├─ index.html
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  ├─ public/
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ config.js
│     ├─ index.css
│     ├─ assets/
│     ├─ components/
│     │  ├─ DemoModal.jsx
│     │  ├─ FeatureCard.jsx
│     │  ├─ Hero.jsx
│     │  ├─ Home.jsx
│     │  ├─ HowItWorks.jsx
│     │  ├─ Login.jsx
│     │  ├─ Promt.jsx
│     │  ├─ Sidebar.jsx
│     │  ├─ Signup.jsx
│     │  └─ Welcome.jsx
│     └─ context/
│        └─ AuthProvider.jsx
└─ backend/test/
   ├─ error.middleware.test.js
   ├─ models.test.js
   ├─ requestLogger.middleware.test.js
   └─ validation.middleware.test.js
```

## Quick Setup (Windows PowerShell)

Run these from the repository root.

Backend:


npm install
npm start
```

Frontend:
npm install
npm run dev
```

## Environment Variables (backend/.env)

```
PORT=3000
MONGO_URL=your_mongo_connection_string
JWT_PASSWORD=your_jwt_secret
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id (optional)
GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
```

## Endpoints (local)

Base: `http://localhost:3000/api/v1`

- `POST /user/signup`
- `POST /user/login`
- `GET /user/logout`
- `POST /synapse-ai/promt` (protected)

## Troubleshooting pointers

- Check `ERRORS_AND_CAUSES.md` for common failures and resolutions.
- Verify `MONGO_URL`, `JWT_PASSWORD`, and Gemini/Google credentials are set for local and production environments.
- If file uploads fail, ensure `backend/uploads/` exists and is writable.

---

For a compact project README that stays in source control, consider renaming this file to `README_PROJECT.md` or linking it from the main `README.md`.
