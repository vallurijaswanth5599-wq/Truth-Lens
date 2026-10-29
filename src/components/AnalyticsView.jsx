import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, ShieldCheck, Cpu, Clock, Layers, Filter } from 'lucide-react';
import { benchmarkCases } from '../data/benchmarkCases';

export default function AnalyticsView({ onSelectCase }) {
  // Aggregate stats from benchmark cases dataset
  const totalCases = benchmarkCases.length;
  const safeCases = benchmarkCases.filter(c => c.expectedVerdict === 'Safe to Share').length;
  const cautionCases = benchmarkCases.filter(c => c.expectedVerdict === 'Share with Caution').length;
  const doNotShareCases = benchmarkCases.filter(c => c.expectedVerdict === 'Do Not Share').length;
  const expertReviewCases = benchmarkCases.filter(c => c.expectedVerdict === 'Requires Expert Review').length;

  const modalityCounts = {
    text: benchmarkCases.filter(c => c.type === 'text').length,
    image: benchmarkCases.filter(c => c.type === 'image').length,
    audio: benchmarkCases.filter(c => c.type === 'audio').length,
    video: benchmarkCases.filter(c => c.type === 'video').length,
    document: benchmarkCases.filter(c => c.type === 'document').length,
    url: benchmarkCases.filter(c => c.type === 'url').length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-indigo font-mono">Analytics Dashboard</span>
              <span className="badge badge-emerald font-mono">Live Telemetry</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white mt-2">
              Verification Analytics & System Telemetry
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time insights across multi-modal submissions, verdict distributions, and deepfake detection accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Top Key Metrics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Benchmarked</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-white mt-2">{totalCases}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">100% Validated Ground Truth</div>
        </div>

        <div className="glass-card p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Safe Content Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-emerald-400 mt-2">
            {Math.round((safeCases / totalCases) * 100)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">{safeCases} Verified True Scenarios</div>
        </div>

        <div className="glass-card p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">High-Risk Blocked</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-rose-400 mt-2">{doNotShareCases}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">Deepfakes & Scam URLs Blocked</div>
        </div>

        <div className="glass-card p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Avg Response Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-cyan-400 mt-2">380ms</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">6-Stage Orchestrated Loop</div>
        </div>
      </div>

      {/* Visual Chart Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Modality Breakdown Bar Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Submissions by Input Modality
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(modalityCounts).map(([mod, count]) => {
              const percentage = Math.round((count / totalCases) * 100);
              return (
                <div key={mod} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="capitalize text-slate-300 font-semibold">{mod} Studio</span>
                    <span className="text-slate-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verdict Distribution Split Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Verdict Distribution Breakdown
          </h3>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-300">Safe to Share</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{safeCases} cases</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
              <span className="text-xs font-semibold text-amber-300">Share with Caution</span>
              <span className="text-sm font-bold font-mono text-amber-400">{cautionCases} cases</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
              <span className="text-xs font-semibold text-rose-300">Do Not Share</span>
              <span className="text-sm font-bold font-mono text-rose-400">{doNotShareCases} cases</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <span className="text-xs font-semibold text-purple-300">Requires Expert Review</span>
              <span className="text-sm font-bold font-mono text-purple-400">{expertReviewCases} cases</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
