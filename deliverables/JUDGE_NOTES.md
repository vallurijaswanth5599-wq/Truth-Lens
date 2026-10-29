# TruthLens — Judge Technical Architecture & Benchmark Notes

## Technical Highlights for Judges

1. **Production Tech Stack**:
   - **Backend**: Python FastAPI with Pydantic v2 schemas and SQLAlchemy 2.0 ORM.
   - **Frontend**: React 19 + TypeScript + Tailwind CSS + Framer Motion.
   - **Databases**: PostgreSQL (Neon) with SQLite fallback, Redis caching layer.

2. **RAG Grounding & Hallucination Prevention**:
   - Every verification request invokes Tavily Deep Search for real-time web retrieval.
   - Sources are scored against a 220+ domain trust database (Nature: 98, Reuters: 92, CDC: 95 vs Infowars: 10).
   - Low trust sources (<30) are automatically filtered out.

3. **Multi-Vector Image Forensics**:
   - Buffer-level C2PA watermark detection (`c2pa`, `jumbf`).
   - XMP tag parsing for Midjourney, DALL-E 3, Stable Diffusion, ComfyUI, Adobe Firefly.
   - EXIF camera hardware verification (Apple, Samsung, Google Pixel, Sony, Canon).
   - Shannon Byte Entropy calculation for optical camera sensor noise vs AI distribution.

4. **Calibrated Scoring Formula**:
   - Dynamic weighted scoring formula:
     $$\text{Credibility} = (W_{\text{img}} \times \text{Auth}) + (W_{\text{text}} \times \text{Gemini}) + (W_{\text{src}} \times \text{Trust})$$
   - Risk score calibrates opposite to credibility, flagged into 3 risk levels (Low, Medium, High).
