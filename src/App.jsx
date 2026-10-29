import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import InputPanel from './components/InputPanel';
import PipelineVisualizer from './components/PipelineVisualizer';
import ReportView from './components/ReportView';
import BenchmarkRunner from './components/BenchmarkRunner';
import AnalyticsView from './components/AnalyticsView';
import HistoryView from './components/HistoryView';
import AgentSpecDetails from './components/AgentSpecDetails';
import PrivacyModal from './components/PrivacyModal';
import { runVerificationPipeline } from './services/verificationEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('verify');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [pageKey, setPageKey] = useState(0);

  // Re-trigger page animation on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPageKey(k => k + 1);
  };

  const [verificationError, setVerificationError] = useState(null);

  const handleStartVerification = async (inputData) => {
    setIsProcessing(true);
    setCurrentReport(null);
    setPipelineProgress(null);
    setVerificationError(null);

    try {
      const report = await runVerificationPipeline(inputData, (progress) => {
        setPipelineProgress(progress);
      });
      setCurrentReport(report);
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationError(err.message || 'Verification pipeline encountered an unexpected error.');
    } finally {
      setIsProcessing(false);
      setPipelineProgress(null);
    }
  };

  const handleSelectCaseFromBenchmark = (benchmarkCase) => {
    handleTabChange('verify');
    handleStartVerification({
      type: benchmarkCase.type,
      content: benchmarkCase.input,
      presetId: benchmarkCase.id,
      isPreset: true,
    });
  };

  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'Inter, system-ui, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          overflowX: 'hidden',
        }}
      >
        {/* Sticky Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
        />

        {/* Main Content — max 1440px centered */}
        <main
          key={pageKey}
          className="animate-fade-in"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1rem, 3vw, 2.5rem)',
          }}
        >

          {/* 1. LANDING PAGE */}
          {activeTab === 'landing' && (
            <LandingPage onGoToVerify={() => handleTabChange('verify')} />
          )}

          {/* 2. VERIFICATION STUDIO */}
          {activeTab === 'verify' && (
            <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {verificationError && (
                <div className="animate-slide-up" style={{
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.125rem' }}>⚠️</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>
                        Verification Pipeline Notice
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#c8d3f0', lineHeight: 1.5 }}>
                        {verificationError}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setVerificationError(null)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8125rem', borderRadius: '10px', flexShrink: 0 }}
                  >
                    Dismiss & Retry
                  </button>
                </div>
              )}

              {!currentReport && (
                <InputPanel
                  onStartVerification={handleStartVerification}
                  isProcessing={isProcessing}
                />
              )}

              {isProcessing && (
                <PipelineVisualizer progress={pipelineProgress} />
              )}

              {currentReport && !isProcessing && (
                <ReportView
                  report={currentReport}
                  onReset={() => {
                    setCurrentReport(null);
                    setVerificationError(null);
                    setPageKey(k => k + 1);
                  }}
                />
              )}
            </div>
          )}

          {/* 3. BENCHMARK SUITE */}
          {activeTab === 'benchmark' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <BenchmarkRunner onSelectCase={handleSelectCaseFromBenchmark} />
            </div>
          )}

          {/* 4. ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <AnalyticsView onSelectCase={handleSelectCaseFromBenchmark} />
            </div>
          )}

          {/* 5. HISTORY & SAVED LOGS */}
          {activeTab === 'history' && (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <HistoryView onSelectCase={handleSelectCaseFromBenchmark} />
            </div>
          )}

          {/* 6. AGENTSPEC DETAILS */}
          {activeTab === 'spec' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <AgentSpecDetails />
            </div>
          )}
        </main>

        {/* Privacy & Safety Modal */}
        <PrivacyModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
}
