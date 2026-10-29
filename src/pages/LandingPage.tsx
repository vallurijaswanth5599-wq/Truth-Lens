import React from 'react';
import { Shield, Search, Cpu, FileCheck, CheckCircle2, AlertTriangle, ArrowRight, Lock, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-24 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
            <Shield className="w-4 h-4" /> AI-Powered Misinformation Verification Engine
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-6 leading-tight">
            Verify Before You Trust or Share
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Empirical multi-vector fact checking across news, text, URLs, deepfake images, documents, and videos using Gemini 2.5 Flash & Tavily Deep Search.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/verify')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-base"
            >
              Start Verification <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-base"
            >
              View Live Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Tavily Deep Search</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Performs live internet search across 220+ categorized domain trust tiers, retrieving authoritative sources and scientific consensus.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Media Forensics & Deepfake Detection</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Multi-vector binary buffer analysis inspecting C2PA watermarks, EXIF metadata, Shannon byte entropy, and latent diffusion noise.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Gemini CoT Reasoning</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Chain-of-Thought reasoning protocol evaluating evidence FOR and AGAINST with explicit claim-source grounding guarantees.
          </p>
        </div>
      </div>
    </div>
  );
};
