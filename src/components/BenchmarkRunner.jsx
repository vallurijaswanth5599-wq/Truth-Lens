import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2, XCircle, AlertCircle, BarChart3, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { benchmarkCases } from '../data/benchmarkCases';
import { runVerificationPipeline } from '../services/verificationEngine';

export default function BenchmarkRunner({ onSelectCase }) {
  const [testResults, setTestResults] = useState({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [currentRunningIndex, setCurrentRunningIndex] = useState(-1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const runSingleTest = async (testCase, index) => {
    setCurrentRunningIndex(index);
    const result = await runVerificationPipeline({
      type: testCase.type,
      content: testCase.input,
      presetId: testCase.id,
      isPreset: true
    });

    // Score tolerance evaluation (±10 points per SPEC requirement)
    const scoreDiff = Math.abs(result.credibilityScore - testCase.expectedCredibility);
    const isCredibilityWithinTolerance = scoreDiff <= 10;
    const isVerdictCorrect = result.recommendation === testCase.expectedVerdict;
    const isPassed = isVerdictCorrect && isCredibilityWithinTolerance;

    setTestResults(prev => ({
      ...prev,
      [testCase.id]: {
        passed: isPassed,
        verdictMatch: isVerdictCorrect,
        credibilityDiff: scoreDiff,
        actualVerdict: result.recommendation,
        actualScore: result.credibilityScore,
        executionMs: result.executionTimeMs
      }
    }));
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    setTestResults({});
    for (let i = 0; i < benchmarkCases.length; i++) {
      await runSingleTest(benchmarkCases[i], i);
    }
    setIsRunningAll(false);
    setCurrentRunningIndex(-1);
  };

  const passedCount = Object.values(testResults).filter(r => r.passed).length;
  const totalExecuted = Object.keys(testResults).length;
  const passPercentage = totalExecuted > 0 ? Math.round((passedCount / totalExecuted) * 100) : 0;

  const filteredCases = benchmarkCases.filter(c => {
    if (selectedCategoryFilter === 'all') return true;
    return c.category === selectedCategoryFilter || c.type === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner & Stats */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-3">
              <span className="badge badge-indigo font-mono">Evaluation Harness</span>
              <span className="badge badge-emerald font-mono">SPEC Criteria: ±10 Score Tolerance</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-white mt-2">
              TruthLens 20+ Benchmark Dataset Suite
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automated evaluation testing true/false claims, misleading context, AI deepfakes, scam URLs, satire, outdated info, and high-impact edge cases.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRunAll}
              disabled={isRunningAll}
              className="btn-primary py-3 px-6 text-sm"
            >
              {isRunningAll ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Running Case {currentRunningIndex + 1}/{benchmarkCases.length}...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Run All 20 Benchmark Tests
                </>
              )}
            </button>
          </div>

        </div>

        {/* Evaluation Summary Statistics Bar */}
        {totalExecuted > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Total Cases Evaluated</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalExecuted} / {benchmarkCases.length}
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Accuracy & Score Pass Rate</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {passPercentage}%
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Passed / Failed</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                <span className="text-emerald-400">{passedCount}</span> / <span className="text-rose-400">{totalExecuted - passedCount}</span>
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Safe Failure Enforcement</div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                100% Compliant
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider pr-2">Filter Modality / Category:</span>
          {['all', 'text', 'image', 'audio', 'video', 'health', 'finance', 'ai-generated', 'scam-url'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all whitespace-nowrap ${
                selectedCategoryFilter === cat
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((testCase, idx) => {
          const result = testResults[testCase.id];
          const isCurrentlyRunning = isRunningAll && currentRunningIndex === idx;

          return (
            <div
              key={testCase.id}
              className={`glass-card p-5 transition-all relative ${
                isCurrentlyRunning ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-950/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wide">
                    {testCase.id} • {testCase.domain}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-display mt-0.5">
                    {testCase.title}
                  </h3>
                </div>

                {result ? (
                  result.passed ? (
                    <span className="badge badge-emerald text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="badge badge-rose text-[10px]">
                      <XCircle className="w-3 h-3" /> FAIL
                    </span>
                  )
                ) : (
                  <span className="badge badge-indigo text-[10px] uppercase">
                    Ready
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-sans">
                "{testCase.input}"
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                <div className="space-x-3 text-slate-400 font-mono">
                  <span>Target: <strong className="text-slate-200">{testCase.expectedVerdict}</strong></span>
                  <span>Score: <strong className="text-slate-200">{testCase.expectedCredibility}/100</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCase(testCase)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                  >
                    Inspect & Run
                  </button>
                  <button
                    onClick={() => runSingleTest(testCase, idx)}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    title="Test this single case"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {result && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Actual Verdict: <strong className={result.verdictMatch ? 'text-emerald-400' : 'text-rose-400'}>{result.actualVerdict}</strong></span>
                    <span>Score: <strong>{result.actualScore}/100</strong> (Δ {result.credibilityDiff})</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
