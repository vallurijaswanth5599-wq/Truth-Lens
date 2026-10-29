import React from 'react';
import { ShieldCheck, Terminal, FileCode, Shield, Sparkles, Layers } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenPrivacy }) {
  return (
    <header className="glass-card mb-8 p-4 md:p-6 border border-slate-800/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none"></div>

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight gradient-text">
                TruthLens AI
              </h1>
              <span className="badge badge-indigo font-mono text-[11px] px-2.5 py-1">
                Single Orchestrator Agent
              </span>
              <span className="badge badge-emerald font-mono text-[11px] px-2.5 py-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Mutagent 0.1.250
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Evidence-first misinformation & multi-modal media authenticity verification platform • Team Nova
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'verify'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'verify' ? 'text-indigo-200' : 'text-indigo-400'}`} />
            Verify Studio
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'benchmark'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className={`w-4 h-4 ${activeTab === 'benchmark' ? 'text-cyan-200' : 'text-cyan-400'}`} />
            22+ Benchmark Suite
          </button>

          <button
            onClick={() => setActiveTab('spec')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'spec' ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileCode className={`w-4 h-4 ${activeTab === 'spec' ? 'text-purple-200' : 'text-purple-400'}`} />
            AgentSpec Details
          </button>

          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-all ml-auto xl:ml-0"
            title="Safety & Ethics Rules"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Safety Rules
          </button>
        </div>

      </div>
    </header>
  );
}
