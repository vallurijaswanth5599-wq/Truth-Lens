# TruthLens RAV System Architecture & Technical Specification

TruthLens is an enterprise-grade **Retrieval-Augmented Verification (RAV)** SaaS platform. It combines live internet search, 300+ domain trust scoring, and evidence-restricted LLM reasoning (Gemini 1.5/3.5/3.6 Flash) to verify claims, URLs, images, videos, and documents.

---

## High-Level Architecture Diagram

<p align="center">
  <img src="truthlens-architecture.png" alt="TruthLens System Architecture" width="100%" />
</p>

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client App
    participant UI as React Frontend (Vite)
    participant Engine as Verification Engine Client (SSE)
    participant API as Express API Server (/api/verify)
    participant Extractor as Claim Extractor
    participant Search as Tavily Search Engine / Web Fallback
    participant Scorer as 300+ Domain Trust Scorer
    participant LLM as Gemini AI (Evidence-Only Mode)
    participant History as In-Memory / PostgreSQL History Store

    User->>UI: Submit Claim / URL / Media
    UI->>Engine: runVerificationPipeline(inputData)
    Engine->>API: POST /api/verify (SSE Stream)
    
    API->>Extractor: Stage 0: Parse input & build queries
    Extractor-->>API: 2-3 Search Queries + Domain Category
    API-->>Engine: SSE Event: Progress Stage 0

    API->>Search: Stage 1: Parallel Web Searches
    Search-->>API: Raw Web Search Results (URLs + Snippets)
    API-->>Engine: SSE Event: Progress Stage 1

    API->>Scorer: Stage 2: Evaluate 300+ Domain Trust Database
    Scorer-->>API: Scored & Filtered Trusted Sources (Trust >= 45)
    API-->>Engine: SSE Event: Progress Stage 2

    API->>API: Stage 3: Aggregate Evidence & Discard Low Trust
    API-->>Engine: SSE Event: Progress Stage 3

    API->>LLM: Stage 4: Gemini Evidence-Only Reasoning
    Note over LLM: Training Knowledge Excluded<br/>Strict JSON Mode<br/>Insufficient Evidence Policy
    LLM-->>API: Structured Verdict JSON + Conflict Detection
    API-->>Engine: SSE Event: Progress Stage 4

    API->>API: Stage 5: Construct Report & Expert Review Packet
    API->>History: Save Report to History Store
    API-->>Engine: SSE Event: Progress Stage 5 + Complete Report Event
    
    Engine-->>UI: Render Report Dashboard
    UI-->>User: Display Credibility, Risk Cards & Cited Evidence Timeline
```

---

## Core Components

| Component | Technology | Responsibility |
|---|---|---|
| **Frontend UI** | React 18, Lucide Icons, Vanilla CSS Design System | Responsive 1440px glassmorphism interface, multi-modal input cards, animated progress rings, executive report dashboard. |
| **API Server** | Node.js, Express, SSE Streaming | High-throughput async REST server with Server-Sent Events streaming real-time stage updates. |
| **Search Engine** | Tavily Search API + DDG / Wikipedia Fallback | Live web retrieval returning page content, URLs, scores, and publication dates. |
| **Trust Scorer** | Custom Tiered Domain Engine | Evaluates 300+ domains across 5 trust tiers (Official/Academic 90-100, Major News 80-92, Fact-Checkers 88-94, Tech/Business 70-85, Blocked <20). |
| **AI Reasoning Engine** | Google Gemini (3.5/3.6 Flash) | Strict JSON mode prompt enforcing evidence-only reasoning, score calibration, and conflict detection. |
| **URL Reputation** | Pattern & Signal Audit | Detects credential phishing keywords, suspicious TLDs, IP address hostnames, and TLS certificate security. |
| **Media Forensics** | EXIF & Signal Analysis | Evaluates image error level patterns, vocal formant spectrums, inter-frame video coherence, and PDF ISO structures. |

---

## API Endpoint Matrix

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, API key detection, and readiness flags. |
| `POST` | `/api/verify` | Primary SSE-streaming RAV pipeline endpoint. |
| `GET` | `/api/history` | Retrieves recent verification reports. |
| `GET` | `/api/history/:id` | Retrieves a specific verification report by Request ID. |
| `DELETE` | `/api/history/:id` | Deletes a report from history. |
| `POST` | `/api/url-audit` | Standalone URL reputation and phishing audit. |
| `POST` | `/api/forensics` | Standalone media forensics and metadata audit. |
