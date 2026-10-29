import React from 'react';
import {
  Cpu, Search, CheckCircle2, ShieldAlert, FileText, Database,
  Sparkles, Loader2, Activity, Zap
} from 'lucide-react';

const stages = [
  { name: 'Claim Extraction',    shortName: 'Extract',    icon: FileText,  color: '#fbbf24' },
  { name: 'Trusted Web Retrieval', shortName: 'Retrieve',  icon: Search,    color: '#22d3ee' },
  { name: 'Fact-Check DB',       shortName: 'Fact-Check', icon: Database,  color: '#34d399' },
  { name: 'Forensics & ELA',     shortName: 'Forensics',  icon: Cpu,       color: '#c084fc' },
  { name: 'Reconciliation',      shortName: 'Reconcile',  icon: ShieldAlert,color: '#818cf8' },
  { name: 'Report Generation',   shortName: 'Report',     icon: Sparkles,  color: '#fb7185' },
];

export default function PipelineVisualizer({ progress }) {
  if (!progress) return null;
  const { currentStepIndex, stepName, stepDesc, logs } = progress;
  const progressPct = Math.round(((currentStepIndex + 1) / 6) * 100);

  return (
    <div
      className="glass-card animate-fade-in-scale"
      style={{
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2rem',
        borderColor: 'rgba(99,102,241,0.35)',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '400px', height: '100%',
        background: 'radial-gradient(ellipse at right, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top row: title + progress */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: '12px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={20} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.125rem',
              fontWeight: 800,
              color: '#f0f4ff',
              letterSpacing: '-0.03em',
              marginBottom: '2px',
            }}>
              Verifying Evidence…
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#8b9cc8' }}>
              Cross-referencing claims against official registries and forensic models
            </p>
          </div>
        </div>

        {/* Progress pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '100px',
          padding: '0.375rem 1rem',
        }}>
          <span style={{
            fontSize: '1rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            color: '#818cf8',
          }}>
            {progressPct}%
          </span>
          <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
              borderRadius: '100px',
              transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                width: '40px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                animation: 'progressShimmer 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ fontSize: '0.625rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.04em' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Stage pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0.625rem',
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Connecting line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '3%',
          right: '3%',
          height: '1px',
          background: `linear-gradient(90deg, rgba(99,102,241,0.4) ${progressPct}%, rgba(255,255,255,0.05) ${progressPct}%)`,
          zIndex: 0,
          transform: 'translateY(-50%)',
          transition: 'background 0.5s ease',
        }} />

        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                borderRadius: '14px',
                border: `1px solid ${isDone ? 'rgba(52,211,153,0.3)' : isCurrent ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`,
                background: isDone
                  ? 'rgba(16,185,129,0.08)'
                  : isCurrent
                  ? 'rgba(99,102,241,0.12)'
                  : 'rgba(255,255,255,0.02)',
                transform: isCurrent ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isCurrent ? '0 8px 24px rgba(99,102,241,0.2)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDone ? 'rgba(52,211,153,0.15)' : isCurrent ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isDone ? 'rgba(52,211,153,0.3)' : isCurrent ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}>
                {isDone ? (
                  <CheckCircle2 size={14} color="#34d399" />
                ) : isCurrent ? (
                  <Loader2 size={14} color="#818cf8" style={{ animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <Icon size={14} color="#2d3561" />
                )}
              </div>
              <span style={{
                fontSize: '0.5625rem',
                fontWeight: 700,
                color: isDone ? '#34d399' : isCurrent ? '#f0f4ff' : '#4f5b8a',
                letterSpacing: '0.02em',
                lineHeight: 1.3,
                textAlign: 'center',
              }}>
                {stage.shortName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live telemetry log */}
      <div style={{
        background: 'rgba(5,7,15,0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.625rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={12} color="#818cf8" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6875rem', fontWeight: 700, color: '#f0f4ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live Agentic Telemetry
            </span>
          </div>
          <span style={{ fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace', color: '#6366f1', fontWeight: 600 }}>
            Mutagent Helix Orchestrator
          </span>
        </div>

        {logs && logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ color: '#6366f1', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, marginTop: '2px' }}>›</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#8b9cc8', lineHeight: 1.5 }}>{log}</span>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#6366f1', animation: 'ping 1.2s ease-in-out infinite', opacity: 0.7 }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#818cf8' }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
            Active: {stepDesc}…
          </span>
        </div>
      </div>
    </div>
  );
}
