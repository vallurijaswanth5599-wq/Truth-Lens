import React, { useState } from 'react';
import {
  ShieldCheck, Sun, Moon, Sparkles, BarChart3, History,
  Home, Shield, Terminal, FileCode, Menu, X, ArrowRight, Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { id: 'verify',    label: 'Verify',    icon: ShieldCheck, accent: '#818cf8' },
  { id: 'landing',   label: 'Overview',  icon: Home,        accent: '#22d3ee' },
  { id: 'benchmark', label: 'Benchmark', icon: Terminal,    accent: '#34d399' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3,   accent: '#c084fc' },
  { id: 'history',   label: 'History',   icon: History,     accent: '#fbbf24' },
  { id: 'spec',      label: 'AgentSpec', icon: FileCode,    accent: '#fb7185' },
];

export default function Navbar({ activeTab, setActiveTab, onOpenPrivacy }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 9999,
          background: 'rgba(5, 7, 15, 0.82)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 2rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>

          {/* ── Brand ── */}
          <button
            onClick={() => handleNav('verify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              flexShrink: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 50%, #10b981 100%)',
              padding: '1.5px',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}>
              <div style={{
                width: '100%', height: '100%',
                background: '#05070f',
                borderRadius: '8.5px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={18} color="#818cf8" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.0625rem',
                  fontWeight: 800,
                  color: '#f0f4ff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  TruthLens<span style={{ color: '#818cf8', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.04em', marginLeft: '4px' }}>AI</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '100px', padding: '2px 8px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>LIVE</span>
                </div>
              </div>
              <div style={{
                fontSize: '0.6875rem',
                color: 'rgba(139,156,200,0.7)',
                letterSpacing: '0.01em',
                marginTop: '1px',
                fontWeight: 400,
                display: 'none',
              }} className="hidden-mobile-brand">
                Evidence-First Verification
              </div>
            </div>
          </button>

          {/* ── Desktop Nav ── */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.125rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            padding: '0.3125rem',
          }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3125rem',
                    padding: '0.4375rem 0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#f0f4ff' : 'rgba(139,156,200,0.8)',
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#f0f4ff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(139,156,200,0.8)';
                    }
                  }}
                >
                  <Icon size={13} color={isActive ? item.accent : 'currentColor'} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ── Right Actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: theme === 'dark' ? '#fbbf24' : '#818cf8',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Safety Rules */}
            <button
              onClick={onOpenPrivacy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4375rem 0.875rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(139,156,200,0.9)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <Shield size={12} />
              Safety
            </button>

            {/* CTA */}
            <button
              onClick={() => handleNav('verify')}
              className="btn-primary"
              style={{ padding: '0.4375rem 1rem', fontSize: '0.8125rem', borderRadius: '10px' }}
            >
              <Sparkles size={13} />
              <span>Start Verifying</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: '#8b9cc8',
              }}
              id="mobile-menu-btn"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(5,7,15,0.96)',
            padding: '0.75rem 1.5rem 1.25rem',
          }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    color: isActive ? '#f0f4ff' : '#8b9cc8',
                    background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: isActive ? 600 : 400,
                    marginBottom: '2px',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={16} color={isActive ? item.accent : '#4f5b8a'} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Responsive CSS for desktop nav / mobile btn */}
      <style>{`
        @media (max-width: 900px) {
          header nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
          .hidden-mobile-brand { display: none !important; }
        }
        @media (max-width: 640px) {
          header > div > div:last-child > button:nth-child(3) { display: none !important; }
          header > div > div:last-child > button:nth-child(4) { display: none !important; }
        }
      `}</style>
    </>
  );
}
