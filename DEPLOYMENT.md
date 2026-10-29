# TruthLens Deployment Guide (Vercel)

This repository is configured to deploy both the **React + Vite Frontend** and the **Python FastAPI Backend** as a unified multi-service application on Vercel.

---

## 🏗️ Architecture & Routing Overview

- **Frontend**: React + Vite static build (`@vercel/static-build`) -> `dist` directory
- **Backend**: Python FastAPI (`@vercel/python`) -> `backend/app/main.py`
- **Routing (`vercel.json`)**:
  - `/api/*` -> FastAPI backend serverless functions
  - `/*` -> Frontend single-page application (SPA) static files

---

## 🚀 How to Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy to preview environment:
   ```bash
   vercel
   ```
3. Deploy to production:
   ```bash
   vercel --prod
   ```

### Method 2: Vercel Dashboard (Git Integration)

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Vercel will automatically detect `vercel.json` and configure:
   - **Framework Preset**: Vite / Other
   - **Root Directory**: `./` (workspace root)
4. Add required environment variables under **Project Settings -> Environment Variables**.

---

## 🔑 Required Vercel Environment Variables

Set the following environment variables in your Vercel Project Settings:

| Environment Variable | Required | Description |
| -------------------- | -------- | ----------- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key for claim analysis & vision pre-pass |
| `TAVILY_API_KEY` | **Yes** | Tavily Search API key for source retrieval |
| `SECRET_KEY` | Optional | JWT secret key (defaults to fallback string if unprovided) |
| `DATABASE_URL` | Optional | Database connection string. On Vercel, defaults to `sqlite:////tmp/truthlens.db`. For persistent multi-region storage, connect PostgreSQL (e.g. Supabase, Neon, Railway). |
| `VITE_API_URL` | Optional | Frontend API base path. Defaults to `/api/v1`. |

---

## 🧪 Local Testing & Verification

1. **Test Frontend Build**:
   ```bash
   npm run build
   ```
2. **Test FastAPI Backend Local Startup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
3. **Run Full-Stack Local Dev**:
   ```bash
   npm run dev
   ```

---

## 🏁 Post-Deployment Checklist

- [x] `vercel.json` present at workspace root
- [x] `requirements.txt` present at workspace root
- [x] FastAPI entrypoint verified at `backend/app/main.py`
- [x] Relative API routing (`/api/v1`) configured in frontend
- [x] Hardcoded `localhost` references removed for production calls
- [x] No secrets or API keys committed to Git
