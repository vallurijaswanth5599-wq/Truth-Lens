# TruthLens — Hackathon Judge Demo Script

**Total Duration**: 3 Minutes

---

### Minute 0:00 – 0:45 | Introduction & Problem Framing
- *"Hello Judges! Misinformation and deepfakes are spreading faster than truth. TruthLens is an AI-powered verification engine built to solve this."*
- Navigate to **Landing Page**. Highlight Apple-inspired glassmorphism UI.
- Explain the core principle: **Verify before you trust or share**.

---

### Minute 0:45 – 1:30 | Live Text Claim Verification Demo
- Click **Start Verification**.
- Enter Text Claim: *"NASA confirmed a giant asteroid will hit Earth next month."*
- Click **Run Full Verification**.
- Show live progress streaming: Claim extraction $\rightarrow$ Tavily Search $\rightarrow$ Domain scoring $\rightarrow$ Gemini CoT reasoning.
- Result: **Do Not Share** (Credibility: 15/100). Show retrieved Snopes & NASA debunks.

---

### Minute 1:30 – 2:15 | Deepfake Image Forensics Demo
- Switch tab to **Image**.
- Upload a synthetic Midjourney portrait image.
- Click **Run Verification**.
- Point out **Media Forensics breakdown**:
  - Detected Signatures: `Midjourney`
  - EXIF Hardware: `Missing / Stripped`
  - Shannon Byte Entropy: `5.4 (Synthetic noise profile)`
  - Deepfake Probability: `94%`

---

### Minute 2:15 – 3:00 | Dashboard & Architecture Wrap-Up
- Open **Dashboard**. Show domain analytics breakdown, credibility distributions, and system health status.
- Show **FastAPI Swagger Docs** (`http://localhost:8000/docs`).
- Explain production ready FastAPI + PostgreSQL + React 19 architecture.
- Thank judges and open for Q&A.
