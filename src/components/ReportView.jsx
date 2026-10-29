import React, { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, CheckCircle2,
  ExternalLink, Download, AlertOctagon, Info, FileText, Cpu, Clock,
  RotateCcw, Sparkles, Share2, Copy, ChevronDown, ChevronUp,
  TrendingUp, Activity, Lock, Globe, BookOpen, Award, Search, Wifi
} from 'lucide-react';
import CircularProgress from './ui/CircularProgress';
import { generatePDFReport } from '../services/pdfReportGenerator';

/* ── Verdict config ── */
const verdictConfig = {
  'Safe to Share': {
    bg:        'rgba(16,185,129,0.07)',
    border:    'rgba(16,185,129,0.3)',
    glow:      'rgba(16,185,129,0.15)',
    gradient:  'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.06) 100%)',
    topLine:   'linear-gradient(90deg, #10b981, #06b6d4)',
    badge:     'badge-emerald',
    textColor: '#34d399',
    scoreColor:'emerald',
    icon:      ShieldCheck,
    desc:      'High-credibility evidence corroborates this content. No material misinformation risks detected.',
    pulse:     '#34d399',
  },
  'Share with Caution': {
    bg:        'rgba(245,158,11,0.07)',
    border:    'rgba(245,158,11,0.3)',
    glow:      'rgba(245,158,11,0.15)',
    gradient:  'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.04) 100%)',
    topLine:   'linear-gradient(90deg, #f59e0b, #fbbf24)',
    badge:     'badge-amber',
    textColor: '#fbbf24',
    scoreColor:'amber',
    icon:      AlertTriangle,
    desc:      'Content contains partial context distortion, unverified claims, or outdated information.',
    pulse:     '#fbbf24',
  },
  'Do Not Share': {
    bg:        'rgba(244,63,94,0.07)',
    border:    'rgba(244,63,94,0.3)',
    glow:      'rgba(244,63,94,0.15)',
    gradient:  'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(251,113,133,0.04) 100%)',
    topLine:   'linear-gradient(90deg, #f43f5e, #fb7185)',
    badge:     'badge-rose',
    textColor: '#fb7185',
    scoreColor:'rose',
    icon:      ShieldAlert,
    desc:      'High misinformation or scam probability. Contradicted by authoritative evidence or synthetic deepfake detected.',
    pulse:     '#fb7185',
  },
  'Requires Expert Review': {
    bg:        'rgba(168,85,247,0.07)',
    border:    'rgba(168,85,247,0.3)',
    glow:      'rgba(168,85,247,0.15)',
    gradient:  'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(192,132,252,0.04) 100%)',
    topLine:   'linear-gradient(90deg, #8b5cf6, #c084fc)',
    badge:     'badge-purple',
    textColor: '#c084fc',
    scoreColor:'purple',
    icon:      HelpCircle,
    desc:      'Evidence is insufficient, conflicting, or incomplete. An expert review packet has been generated.',
    pulse:     '#c084fc',
  },
  'Insufficient Evidence': {
    bg:        'rgba(71,85,105,0.07)',
    border:    'rgba(71,85,105,0.3)',
    glow:      'rgba(71,85,105,0.15)',
    gradient:  'linear-gradient(135deg, rgba(71,85,105,0.12) 0%, rgba(100,116,139,0.04) 100%)',
    topLine:   'linear-gradient(90deg, #475569, #64748b)',
    badge:     'badge-slate',
    textColor: '#94a3b8',
    scoreColor:'indigo',
    icon:      Search,
    desc:      'No reliable internet evidence was found to verify or refute this claim. Manual expert review is required.',
    pulse:     '#94a3b8',
  },
};

/* ── Score Card ── */
function ScoreCard({ label, score, color, sublabel, icon: Icon }) {
  const colorMap = {
    emerald: { text: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', glow: 'rgba(16,185,129,0.12)' },
    amber:   { text: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', glow: 'rgba(245,158,11,0.12)' },
    rose:    { text: '#fb7185', bg: 'rgba(244,63,94,0.08)',  border: 'rgba(244,63,94,0.2)',  glow: 'rgba(244,63,94,0.12)' },
    indigo:  { text: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.12)' },
    purple:  { text: '#c084fc', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', glow: 'rgba(168,85,247,0.12)' },
  };
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div style={{
      flex: 1,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '20px',
      padding: '1.75rem 1.25rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${c.glow}`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${c.text}70, transparent)` }} />
      <CircularProgress score={score} size={100} strokeWidth={8} label="" color={color} />
      <div style={{ marginTop: '0.875rem' }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9375rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '0.6875rem', color: c.text, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Evidence Timeline Item ── */
function TimelineItem({ step, title, desc, status, delay }) {
  const statusColors = { done: '#34d399', active: '#818cf8', pending: '#2d3561' };
  const c = statusColors[status] || statusColors.pending;
  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem', animationDelay: delay }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '50%',
          background: `${c}18`,
          border: `2px solid ${c}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {status === 'done' ? <CheckCircle2 size={14} color={c} /> : <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', fontWeight: 800, color: c }}>{step}</span>}
        </div>
        <div style={{ width: '1.5px', flex: 1, background: `linear-gradient(to bottom, ${c}30, transparent)`, marginTop: '4px', minHeight: '24px' }} />
      </div>
      <div style={{ paddingBottom: '1.25rem', flex: 1 }}>
        <div style={{ fontWeight: 700, color: status === 'done' ? '#f0f4ff' : '#8b9cc8', fontSize: '0.9375rem', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: '0.8125rem', color: '#4f5b8a', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function ReportView({ report, onReset }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedSection, setExpandedSection] = useState('reasoning');

  if (!report) return null;

  const {
    requestId, executionTimeMs, recommendation,
    credibilityScore, confidenceScore, riskLevel,
    domain, claims, sources, forensics, explanation, isHighImpact,
    expertReviewPacket,
    conflictsDetected, conflictSummary,
    evidenceSummary, recommendationRationale,
  } = report;

  const vc = verdictConfig[recommendation] || verdictConfig['Share with Caution'];
  const VerdictIcon = vc.icon;
  const riskScore = riskLevel === 'High' ? 88 : riskLevel === 'Medium' ? 52 : 14;
  const riskColor = riskLevel === 'High' ? 'rose' : riskLevel === 'Medium' ? 'amber' : 'emerald';
  const riskLabel = riskLevel === 'High' ? 'HIGH' : riskLevel === 'Medium' ? 'MEDIUM' : 'LOW';

  const downloadPDF = () => {
    try {
      generatePDFReport(report);
    } catch (err) {
      console.error('PDF generation failed:', err);
      // Fallback to JSON if PDF fails
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `truthlens-report-${requestId}.json`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`TruthLens Report ${requestId} — ${recommendation} (Credibility: ${credibilityScore}/100)`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleSection = (s) => setExpandedSection(expandedSection === s ? null : s);

  const evidenceSteps = [
    { step: '01', title: 'Claim & Input Classification', desc: 'Parsed input, extracted verifiable entities, generated optimized Tavily search queries.', status: 'done' },
    { step: '02', title: 'Live Internet Search', desc: 'Queried Tavily Search API with multiple queries — retrieved top-ranked real-time web results.', status: 'done' },
    { step: '03', title: 'Source Trust Filtering', desc: 'Scored each result against 300+ domain trust database; filtered out low-reliability sources.', status: 'done' },
    { step: '04', title: 'Evidence Aggregation', desc: `Compiled ${sources?.length || 0} trusted sources; discarded low-score domains below 45/100 trust threshold.`, status: 'done' },
    { step: '05', title: 'Gemini Evidence-Only Reasoning', desc: 'Gemini 1.5 Flash analyzed evidence with hallucination-prohibited prompt. Training knowledge excluded.', status: 'done' },
    { step: '06', title: 'Explainable Report Generation', desc: 'Packaged verdict, citations, conflict analysis, risk scores, and expert review packet.', status: 'done' },
  ];



  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Verdict Hero Banner ── */}
      <div style={{
        background: vc.gradient,
        border: `1px solid ${vc.border}`,
        borderRadius: '24px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 20px 60px ${vc.glow}, 0 0 0 1px ${vc.border}`,
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: vc.topLine }} />

        {/* Ambient radial */}
        <div style={{
          position: 'absolute', top: '-50%', right: '-10%',
          width: '500px', height: '500px',
          background: `radial-gradient(ellipse, ${vc.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>

          {/* Left: verdict */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            {/* Metadata chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className={`badge ${vc.badge}`}>Recommendation</span>
              <span className="badge badge-slate" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Clock size={10} />
                {executionTimeMs}ms
              </span>
              {domain && <span className="badge badge-indigo">{domain}</span>}
              {isHighImpact && (
                <span className="badge badge-amber">
                  <AlertOctagon size={10} />
                  High-Impact Domain
                </span>
              )}
            </div>

            {/* Verdict display */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.125rem', marginBottom: '1rem' }}>
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '16px',
                background: `${vc.textColor}18`,
                border: `1px solid ${vc.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 8px 24px ${vc.glow}`,
              }}>
                <VerdictIcon size={26} color={vc.textColor} />
              </div>
              <div>
                <h2 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight: 900,
                  color: vc.textColor,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  marginBottom: '0.375rem',
                }}>
                  {recommendation}
                </h2>
                <p style={{ fontSize: '0.9375rem', color: '#8b9cc8', lineHeight: 1.65, maxWidth: '520px' }}>
                  {recommendationRationale || explanation || vc.desc}
                </p>
              </div>
            </div>

            {/* Request ID */}
            <div style={{ fontSize: '0.6875rem', fontFamily: 'JetBrains Mono, monospace', color: '#4f5b8a' }}>
              Request ID: <span style={{ color: '#8b9cc8' }}>{requestId}</span>
            </div>
          </div>

          {/* Right: Score triptych */}
          <div style={{
            display: 'flex',
            gap: '0.875rem',
            background: 'rgba(5,7,15,0.5)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '1.25rem',
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}>
            <ScoreCard
              label="Credibility"
              score={credibilityScore}
              color={credibilityScore >= 70 ? 'emerald' : credibilityScore >= 40 ? 'amber' : 'rose'}
              sublabel={credibilityScore >= 70 ? 'VERIFIED' : credibilityScore >= 40 ? 'PARTIAL' : 'LOW'}
            />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <ScoreCard
              label="Confidence"
              score={confidenceScore}
              color="indigo"
              sublabel={`${confidenceScore}% CI`}
            />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <ScoreCard
              label="Risk Factor"
              score={riskScore}
              color={riskColor}
              sublabel={riskLabel}
            />
          </div>
        </div>
      </div>

      {/* ── High-Impact Warning ── */}
      {isHighImpact && (
        <div className="animate-slide-up" style={{
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={16} color="#fbbf24" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.875rem', marginBottom: '0.25rem' }}>High-Impact Domain Notice</div>
            <div style={{ fontSize: '0.8125rem', color: '#8b9cc8', lineHeight: 1.65 }}>
              This submission touches public health, finance, law, or election integrity. TruthLens provides evidence-based analytical assessments; it does not replace official medical, legal, or regulatory counsel.
            </div>
          </div>
        </div>
      )}

      {/* ── Conflicting Sources Banner ── */}
      {conflictsDetected && (
        <div className="animate-slide-up" style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
        }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={16} color="#f87171" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.875rem', marginBottom: '0.25rem' }}>⚠️ Conflicting Sources Detected</div>
            <div style={{ fontSize: '0.8125rem', color: '#8b9cc8', lineHeight: 1.65 }}>
              {conflictSummary || 'Retrieved sources contain significantly contradictory claims. The credibility and confidence scores reflect this uncertainty. Independent expert review is recommended.'}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

        {/* ── Evidence Timeline ── */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={14} color="#818cf8" />
            </div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
              Evidence Timeline
            </h3>
            <span className="badge badge-emerald" style={{ marginLeft: 'auto', fontSize: '0.5625rem' }}>
              <CheckCircle2 size={9} />
              6/6 Complete
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {evidenceSteps.map((step, i) => (
              <TimelineItem key={i} {...step} delay={`${i * 80}ms`} />
            ))}
          </div>
        </div>

        {/* ── Perplexity-style Reasoning Panel ── */}
        <div className="answer-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={14} color="#22d3ee" />
            </div>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
              AI Reasoning & Explanation
            </h3>
          </div>

          {/* Perplexity-style answer card */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '1.125rem',
            marginBottom: '1rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              left: 0, top: '1rem', bottom: '1rem',
              width: '3px',
              background: 'linear-gradient(to bottom, #6366f1, #06b6d4)',
              borderRadius: '100px',
            }} />
            <p style={{ fontSize: '0.9375rem', color: '#c8d3f0', lineHeight: 1.75, paddingLeft: '0.875rem' }}>
              {explanation}
            </p>
          </div>

          {/* Expert Review Packet */}
          {expertReviewPacket && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                ['Claims Extracted', expertReviewPacket.claimsExtracted],
                ['Sources Cited', expertReviewPacket.authoritativeSourcesCited],
                ['Uncertainty Flags', expertReviewPacket.uncertaintyDisclosed?.length || 0],
                ['Provenance', 'Verified'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.5625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{k}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#818cf8', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Claim Breakdown ── */}
      {claims && claims.length > 0 && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('claims')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.375rem 1.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: expandedSection === 'claims' ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={14} color="#22d3ee" />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                Claim Extraction & Verification
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.5625rem' }}>{claims.length} claim{claims.length !== 1 ? 's' : ''}</span>
            </div>
            {expandedSection === 'claims' ? <ChevronUp size={16} color="#4f5b8a" /> : <ChevronDown size={16} color="#4f5b8a" />}
          </button>

          {expandedSection === 'claims' && (
            <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {claims.map((claim, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${claim.verified ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#c8d3f0', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                      "{claim.text?.length > 120 ? claim.text.substring(0, 120) + '…' : claim.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {claim.verified ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#34d399', fontWeight: 700 }}>
                          <CheckCircle2 size={12} /> Corroborated by primary evidence
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fb7185', fontWeight: 700 }}>
                          <AlertTriangle size={12} /> {claim.contradiction || 'Unverified or Contradicted'}
                        </span>
                      )}
                    </div>
                  </div>
                  {claim.source && (
                    <span className="badge badge-indigo" style={{ fontSize: '0.5625rem', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                      {claim.source.length > 40 ? claim.source.substring(0, 40) + '…' : claim.source}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Media Forensics ── */}
      {forensics && (
        <div className="glass-card" style={{ overflow: 'hidden', borderColor: 'rgba(168,85,247,0.2)' }}>
          <button
            onClick={() => toggleSection('forensics')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.375rem 1.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: expandedSection === 'forensics' ? '1px solid rgba(168,85,247,0.15)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={14} color="#c084fc" />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                Media Forensics & Deepfake Analysis
              </span>
            </div>
            {expandedSection === 'forensics' ? <ChevronUp size={16} color="#4f5b8a" /> : <ChevronDown size={16} color="#4f5b8a" />}
          </button>

          {expandedSection === 'forensics' && (
            <div style={{ padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 5 Primary Forensic Score Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {/* 1. Deepfake Probability */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${forensics.deepfakeProbability >= 50 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Deepfake Probability
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: forensics.deepfakeProbability >= 50 ? '#fb7185' : '#34d399', fontFamily: 'Outfit, sans-serif' }}>
                    {forensics.deepfakeProbability ?? 0}%
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: forensics.deepfakeProbability >= 50 ? '#fb7185' : '#34d399', fontFamily: 'JetBrains Mono, monospace' }}>
                    {forensics.deepfakeProbability >= 50 ? '⚠ AI-GENERATED' : '✓ AUTHENTIC'}
                  </div>
                </div>

                {/* 2. Artifact Score */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  borderRadius: '14px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Artifact Score
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc', fontFamily: 'Outfit, sans-serif' }}>
                    {forensics.artifactScore ?? 0}/100
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: '#8b9cc8' }}>
                    GAN / ELA Artifacts
                  </div>
                </div>

                {/* 3. Authenticity Score */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '14px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Authenticity Score
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', fontFamily: 'Outfit, sans-serif' }}>
                    {forensics.authenticityScore ?? (100 - (forensics.deepfakeProbability || 0))}/100
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: '#34d399' }}>
                    Sensor & EXIF Trust
                  </div>
                </div>

                {/* 4. Confidence Score */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '14px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Model Confidence
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#818cf8', fontFamily: 'Outfit, sans-serif' }}>
                    {forensics.confidence ?? confidenceScore}%
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: '#8b9cc8' }}>
                    Certainty Level
                  </div>
                </div>

                {/* 5. Risk Score */}
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${(forensics.riskScore || riskScore) >= 65 ? 'rgba(244,63,94,0.2)' : 'rgba(251,191,36,0.2)'}`,
                  borderRadius: '14px',
                  padding: '1rem',
                }}>
                  <div style={{ fontSize: '0.625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    Forensic Risk
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: (forensics.riskScore || riskScore) >= 65 ? '#fb7185' : '#fbbf24', fontFamily: 'Outfit, sans-serif' }}>
                    {forensics.riskScore ?? riskScore}/100
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.6875rem', color: (forensics.riskScore || riskScore) >= 65 ? '#fb7185' : '#fbbf24' }}>
                    Misinformation Risk
                  </div>
                </div>
              </div>

              {/* Dynamic Evidence Checklist */}
              {forensics.evidenceList && forensics.evidenceList.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                }}>
                  <div style={{ fontSize: '0.6875rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.625rem' }}>
                    Evidence Checklist Used For Score Calculation
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {forensics.evidenceList.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                        <span style={{
                          color: item.type === 'danger' ? '#fb7185' : item.type === 'warning' ? '#fbbf24' : item.type === 'success' ? '#34d399' : '#818cf8',
                          fontWeight: 800,
                        }}>
                          {item.type === 'danger' ? '❌' : item.type === 'warning' ? '⚠️' : item.type === 'success' ? '✓' : 'ℹ'}
                        </span>
                        <span style={{ color: '#c8d3f0', lineHeight: 1.5 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Forensic Conclusion Box */}
              {forensics.forensicConclusion && (
                <div style={{
                  background: forensics.deepfakeProbability >= 50 ? 'rgba(244,63,94,0.06)' : 'rgba(16,185,129,0.06)',
                  border: `1px solid ${forensics.deepfakeProbability >= 50 ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: forensics.deepfakeProbability >= 50 ? '#fb7185' : '#34d399', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.25rem' }}>
                    FORENSIC VERDICT & EXPLANATION
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#c8d3f0', lineHeight: 1.6 }}>
                    {forensics.forensicConclusion}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Trusted Sources ── */}
      {sources && sources.length > 0 && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <button
            onClick={() => toggleSection('sources')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.375rem 1.75rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: expandedSection === 'sources' ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={14} color="#34d399" />
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                Trusted Sources & Citations
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.5625rem' }}>{sources.length} source{sources.length !== 1 ? 's' : ''}</span>
            </div>
            {expandedSection === 'sources' ? <ChevronUp size={16} color="#4f5b8a" /> : <ChevronDown size={16} color="#4f5b8a" />}
          </button>

          {expandedSection === 'sources' && (
            <div style={{ padding: '1.25rem 1.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.125rem',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    gap: '1rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9375rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {src.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace' }}>{src.type}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#2d3561' }} />
                      {/* Reliability bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div style={{ width: '48px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${src.reliability}%`, height: '100%', background: src.reliability >= 90 ? '#34d399' : src.reliability >= 70 ? '#fbbf24' : '#fb7185', borderRadius: '100px' }} />
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: src.reliability >= 90 ? '#34d399' : '#fbbf24', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{src.reliability}%</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink size={14} color="#4f5b8a" style={{ flexShrink: 0 }} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Action Footer ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.875rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Left: reset */}
        <button onClick={onReset} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
          <RotateCcw size={14} />
          Verify Another
        </button>

        {/* Right: export actions */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            onClick={copyLink}
            className="btn-secondary"
            style={{ fontSize: '0.8125rem', borderRadius: '12px' }}
          >
            {copiedLink ? <CheckCircle2 size={13} color="#34d399" /> : <Copy size={13} />}
            {copiedLink ? 'Copied!' : 'Copy Summary'}
          </button>

          <button
            onClick={downloadPDF}
            className="btn-primary"
            style={{
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
              borderRadius: '12px',
            }}
          >
            <Download size={14} />
            Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
