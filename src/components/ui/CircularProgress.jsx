import React, { useEffect, useState } from 'react';

const colorMap = {
  emerald: { stroke: '#10b981', glow: '#10b981', text: '#34d399', bg: 'rgba(16,185,129,0.08)' },
  amber:   { stroke: '#f59e0b', glow: '#f59e0b', text: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
  rose:    { stroke: '#f43f5e', glow: '#f43f5e', text: '#fb7185', bg: 'rgba(244,63,94,0.08)' },
  indigo:  { stroke: '#6366f1', glow: '#818cf8', text: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
  cyan:    { stroke: '#06b6d4', glow: '#22d3ee', text: '#22d3ee', bg: 'rgba(6,182,212,0.08)' },
  purple:  { stroke: '#8b5cf6', glow: '#c084fc', text: '#c084fc', bg: 'rgba(139,92,246,0.08)' },
};

export default function CircularProgress({ score, size = 110, strokeWidth = 10, label, color = 'indigo' }) {
  const [displayScore, setDisplayScore] = useState(0);
  const theme = colorMap[color] || colorMap.indigo;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    setDisplayScore(0);
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.625rem',
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          inset: '10%',
          borderRadius: '50%',
          background: theme.bg,
          filter: `blur(12px)`,
        }} />

        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.05s linear',
              filter: `drop-shadow(0 0 6px ${theme.glow}80)`,
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: size > 100 ? '1.625rem' : '1.25rem',
            fontWeight: 900,
            color: theme.text,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {displayScore}
          </span>
        </div>
      </div>

      <span style={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: 'rgba(139,156,200,0.7)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
      }}>
        {label}
      </span>
    </div>
  );
}
