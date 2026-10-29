import React from 'react';
import { FileCode, CheckCircle2, ShieldAlert, Cpu, AlertCircle, Database, Lock, Layers } from 'lucide-react';

export default function AgentSpecDetails() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Spec Overview Header */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="badge badge-indigo font-mono">AgentSpec v0.3.0</span>
              <span className="badge badge-emerald font-mono">Target: local-codex</span>
              <span className="badge badge-purple font-mono">Single Orchestrator</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white mt-2">
              TruthLens Agent Specification Architecture
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Generated at <code className="text-indigo-400">.mutagent/specs/truthlens/agentspec.yaml</code> & <code className="text-purple-400">.codex/agents/truthlens.md</code>
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Decisions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Orchestrator Architecture Card */}
        <div className="glass-card p-6 border-indigo-500/30">
          <h3 className="text-base font-bold font-display text-indigo-300 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Architecture: Single Orchestrator Agent
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Rather than relying on multiple uncoordinated autonomous agents, TruthLens uses a single orchestrator that manages input classification, capability routing, evidence reconciliation, and unified report rendering.
          </p>
          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-emerald-400">✓ Single Point of Calibration</div>
            <div className="text-emerald-400">✓ Deterministic Tool Disclosures</div>
            <div className="text-emerald-400">✓ Explicit Safety Boundaries</div>
          </div>
        </div>

        {/* Verification Pipeline SOP */}
        <div className="glass-card p-6 border-purple-500/30">
          <h3 className="text-base font-bold font-display text-purple-300 mb-3 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Verification SOP Pipeline
          </h3>
          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-mono">
            <li>Identify format, OCR text, extract EXIF & claims</li>
            <li>Query trusted web search & fact-check DBs</li>
            <li>Analyze media forensics (ELA, AI diffusion artifacts)</li>
            <li>Inspect URL age, TLS, and phishing reputation</li>
            <li>Reconcile conflicting / missing evidence & tools</li>
            <li>Calculate Credibility (0-100) & Confidence (%)</li>
            <li>Select 1 of 4 recommendations & format report</li>
          </ol>
        </div>

      </div>

      {/* Safety Rules & Non-Goals Card */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold font-display text-slate-100 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" />
          Strict Safety Directives & Non-Goals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">TruthLens Must NOT:</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><span className="text-rose-400">✕</span> Fabricate citations, evidence, or detector results</li>
              <li className="flex items-center gap-2"><span className="text-rose-400">✕</span> Force binary conclusions when evidence is missing</li>
              <li className="flex items-center gap-2"><span className="text-rose-400">✕</span> Automatically publish findings or contact authorities</li>
              <li className="flex items-center gap-2"><span className="text-rose-400">✕</span> Retain uploaded media permanently without consent</li>
              <li className="flex items-center gap-2"><span className="text-rose-400">✕</span> Provide binding legal, medical, or financial advice</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tool Failure Policy:</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an external fact-check API or media forensic tool fails or times out:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Continue pipeline using remaining available tools</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Disclose missing tool explicitly in final report</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Appropriately lower total confidence score</li>
              <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Return "Requires Expert Review" if verdict is unreliable</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
