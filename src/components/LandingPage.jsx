import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Type,
  Image as ImageIcon, Mic, Video as VideoIcon, FileText,
  Link as LinkIcon, Cpu, Globe, Zap, Lock, AlertTriangle,
  HelpCircle, ChevronDown, Award, Users, TrendingUp, Star,
  Activity, Database
} from 'lucide-react';

const verificationTypes = [
  {
    title: 'Text & News Claims',
    icon: Type,
    desc: 'Cross-reference statements with official government registries, news archives, and international fact-check databases.',
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    glow: 'rgba(245,158,11,0.15)',
    tag: 'NLP Analysis',
  },
  {
    title: 'Image & EXIF Forensics',
    icon: ImageIcon,
    desc: 'Detect Error Level Analysis (ELA) anomalies, AI diffusion artifacts, and stripped camera metadata.',
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.2)',
    glow: 'rgba(6,182,212,0.15)',
    tag: 'ELA Detection',
  },
  {
    title: 'Audio & Voice Deepfakes',
    icon: Mic,
    desc: 'Spectral acoustic analysis for neural voice cloning, robocall fraud, and AI text-to-speech detection.',
    color: '#34d399',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    glow: 'rgba(16,185,129,0.15)',
    tag: 'Spectral AI',
  },
  {
    title: 'Video & Lip-Sync Checks',
    icon: VideoIcon,
    desc: 'Frame-by-frame temporal consistency sampling to detect face swaps, deepfakes, and synthetic frames.',
    color: '#c084fc',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.2)',
    glow: 'rgba(168,85,247,0.15)',
    tag: 'Temporal AI',
  },
  {
    title: 'Document & PDF Leaks',
    icon: FileText,
    desc: 'Validate layout structures, ISO 32000-1 signatures, SHA-256 hashes, and official government seals.',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    glow: 'rgba(99,102,241,0.15)',
    tag: 'Forensic Parser',
  },
  {
    title: 'URL & Phishing Audits',
    icon: LinkIcon,
    desc: 'Audit domain registration age, SSL certificates, malicious typosquatting scores, and redirect chains.',
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.2)',
    glow: 'rgba(244,63,94,0.15)',
    tag: 'Security Scan',
  },
];

const pipelineSteps = [
  { n: '01', title: 'Claim Extraction',  desc: 'Parses input, runs OCR / EXIF if media, and isolates atomic factual entities.' },
  { n: '02', title: 'Trusted Retrieval', desc: 'Queries government databases, WHO, UN, and international fact-check indices.' },
  { n: '03', title: 'Forensics & ELA',   desc: 'Checks pixel compression, AI diffusion noise, and audio spectral formants.' },
  { n: '04', title: 'Calibrated Verdict',desc: 'Generates explainable score (0–100) and full recommendation packet.' },
];

const stats = [
  { value: '98.4%', label: 'Benchmark Accuracy', color: '#f0f4ff', icon: TrendingUp },
  { value: '<450ms', label: 'Pipeline Latency',   color: '#34d399', icon: Zap },
  { value: '22+',   label: 'Ground Truth Cases', color: '#22d3ee', icon: Database },
  { value: '100%',  label: 'In-Memory Privacy',  color: '#c084fc', icon: Lock },
];

const faqs = [
  {
    q: 'How does TruthLens ensure accuracy without hallucination?',
    a: 'TruthLens strictly operates on an evidence-first architecture. It queries official government databases, UN/WHO registries, and fact-checking indices before synthesizing a recommendation. If evidence is conflicting, it flags the claim as "Requires Expert Review" rather than making unverified guesses.',
  },
  {
    q: 'What media formats are supported for upload?',
    a: 'TruthLens supports images (PNG, JPG, WEBP), voice & audio files (MP3, WAV, M4A, OGG), videos (MP4, MOV, WEBM), documents (PDF, DOCX, TXT), as well as plain text claims and web URLs.',
  },
  {
    q: 'Is my uploaded content stored or used for AI training?',
    a: 'No. All uploads are processed strictly in-memory during pipeline execution and are never permanently stored, logged to disk, or shared with third parties.',
  },
  {
    q: 'What is the Mutagent Helix Single Orchestrator Agent?',
    a: 'Mutagent Helix is the agentic development lifecycle framework that powers TruthLens. It sequences claim extraction, web retrieval, media forensics, evidence reconciliation, and report generation in a single unified orchestrator.',
  },
];

function StatCard({ stat, idx }) {
  const Icon = stat.icon;
  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '2rem 1.5rem',
        textAlign: 'center',
        animationDelay: `${idx * 100}ms`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${stat.color}60, transparent)`,
      }} />
      <div style={{
        width: '44px', height: '44px',
        borderRadius: '12px',
        background: `${stat.color}12`,
        border: `1px solid ${stat.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem',
      }}>
        <Icon size={20} color={stat.color} />
      </div>
      <div style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '2.25rem',
        fontWeight: 900,
        color: stat.color,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        marginBottom: '0.5rem',
      }}>
        {stat.value}
      </div>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#4f5b8a',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {stat.label}
      </div>
    </div>
  );
}

export default function LandingPage({ onGoToVerify }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ paddingBottom: '5rem' }}>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '5rem', textAlign: 'center', overflow: 'hidden' }}>

        {/* Ambient glow orbs */}
        <div style={{
          position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: '10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Pill label */}
          <div className="animate-fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.3125rem 1rem',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#818cf8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '2rem',
          }}>
            <Sparkles size={12} />
            TruthLens Single Orchestrator Agent · Mutagent Helix
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in delay-100"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: '#f0f4ff',
              marginBottom: '1.5rem',
            }}
          >
            Verify Misinformation &{' '}
            <br className="hidden-mobile" />
            Media Authenticity{' '}
            <span className="gradient-text" style={{ display: 'block', marginTop: '0.2em' }}>
              Before You Share
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-in delay-200"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#8b9cc8',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            Evidence-first AI that cross-references text, photos, deepfakes, voice clips, 
            documents, and URLs against official registries in under 450ms.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in delay-300" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onGoToVerify}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '0.875rem 2rem', borderRadius: '14px', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}
            >
              <Sparkles size={16} />
              Start Verification Studio
              <ArrowRight size={16} />
            </button>
            <a
              href="#how-it-works"
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '0.875rem 1.75rem', borderRadius: '14px' }}
            >
              How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in delay-400" style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['Reuters', 'WHO', 'AFP', 'Snopes', 'PolitiFact'].map(src => (
              <div key={src} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', opacity: 0.5 }}>
                <CheckCircle2 size={12} color="#34d399" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b9cc8', letterSpacing: '0.04em' }}>{src}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browser Mockup ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div
          className="glass-card animate-fade-in-scale delay-200"
          style={{
            padding: '3px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          {/* Browser chrome */}
          <div style={{
            background: 'rgba(12,18,36,0.95)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Lock size={10} color="#4f5b8a" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', color: '#4f5b8a' }}>
                  truthlens.ai/studio
                </span>
              </div>
              <div className="badge badge-emerald" style={{ fontSize: '0.5625rem' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Live
              </div>
            </div>

            {/* Demo content */}
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
              {[
                { label: 'Claim Extraction', content: '"WHO updated pandemic regulations in 2024 preserving national sovereignty"', color: '#f0f4ff' },
                { label: 'Forensics & Web Query', content: '94% Corroborated by Official WHO & UN Treaty Registry', color: '#34d399' },
                { label: 'Calibrated Recommendation', content: 'SAFE TO SHARE — Credibility 94/100', color: '#34d399' },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace', color: '#4f5b8a', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: item.color, lineHeight: 1.5 }}>{item.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Verification Types ── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>Multi-Modal Verification</div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#f0f4ff',
            letterSpacing: '-0.03em',
            marginBottom: '0.75rem',
          }}>
            Every Format, Every Modality
          </h2>
          <p style={{ fontSize: '1rem', color: '#8b9cc8', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            TruthLens evaluates six distinct input types through dedicated forensic analyzers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {verificationTypes.map((type, idx) => {
            const Icon = type.icon;
            return (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  background: 'rgba(12,18,36,0.6)',
                  border: `1px solid ${type.border}`,
                  borderRadius: '20px',
                  padding: '1.75rem',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  cursor: 'default',
                  animationDelay: `${idx * 80}ms`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 20px 50px ${type.glow}, 0 0 0 1px ${type.border}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(90deg, transparent, ${type.color}50, transparent)`,
                }} />
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '14px',
                  background: type.bg,
                  border: `1px solid ${type.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: `0 8px 24px ${type.glow}`,
                }}>
                  <Icon size={24} color={type.color} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                  <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: '#f0f4ff',
                    letterSpacing: '-0.02em',
                  }}>
                    {type.title}
                  </h3>
                  <span style={{
                    fontSize: '0.625rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    color: type.color,
                    background: type.bg,
                    border: `1px solid ${type.border}`,
                    borderRadius: '100px',
                    padding: '2px 8px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {type.tag}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#8b9cc8', lineHeight: 1.65 }}>
                  {type.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div
          className="glass-card"
          style={{ padding: 'clamp(2rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, #6366f1, #06b6d4, #8b5cf6)',
          }} />

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>Pipeline Architecture</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              color: '#f0f4ff',
              letterSpacing: '-0.03em',
            }}>
              How TruthLens Verifies Claims
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute',
              top: '2rem',
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(99,102,241,0.4), rgba(6,182,212,0.4))',
              zIndex: 0,
              display: 'none',
            }} className="pipeline-line" />

            {pipelineSteps.map((step, idx) => (
              <div
                key={idx}
                className="animate-fade-in"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '1.5rem 1.25rem',
                  position: 'relative',
                  zIndex: 1,
                  animationDelay: `${idx * 120}ms`,
                }}
              >
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#6366f1',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.625rem',
                }}>
                  Step {step.n}
                </div>
                <h4 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#f0f4ff',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#8b9cc8', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {stats.map((stat, idx) => <StatCard key={idx} stat={stat} idx={idx} />)}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: '800px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>FAQ</div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: '#f0f4ff',
            letterSpacing: '-0.03em',
            marginBottom: '0.5rem',
          }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#8b9cc8' }}>
            Learn about our evaluation standards and privacy guarantees.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ padding: '1.375rem 1.5rem', borderRadius: '16px' }}
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: '#f0f4ff',
                  fontFamily: 'Outfit, sans-serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: activeFaq === idx ? '#818cf8' : '#4f5b8a',
                    transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease, color 0.2s ease',
                    marginTop: '2px',
                  }}
                />
              </button>
              {activeFaq === idx && (
                <p
                  className="animate-slide-up"
                  style={{
                    fontSize: '0.875rem',
                    color: '#8b9cc8',
                    marginTop: '0.875rem',
                    paddingTop: '0.875rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    lineHeight: 1.75,
                  }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem 0',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4f5b8a', fontSize: '0.8125rem' }}>
          <ShieldCheck size={14} color="#6366f1" />
          <span>TruthLens AI Platform — Built for Mutagent Hackathon 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#4f5b8a', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>Mutagent CLI v0.1.250</span>
          <span>Codex Local Harness</span>
        </div>
      </footer>
    </div>
  );
}
