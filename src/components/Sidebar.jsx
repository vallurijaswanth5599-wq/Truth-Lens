import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  FileCode, 
  BarChart3, 
  History, 
  Home, 
  Shield, 
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'verify', label: 'Verification Studio', icon: ShieldCheck, category: 'CORE WORKSPACE' },
    { id: 'landing', label: 'Platform Overview', icon: Home, category: 'CORE WORKSPACE' },
    { id: 'benchmark', label: '22+ Benchmark Suite', icon: Terminal, category: 'EVALUATION & QUALITY' },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, category: 'EVALUATION & QUALITY' },
    { id: 'history', label: 'Verification Logs', icon: History, category: 'HISTORY & REPORTS' },
    { id: 'spec', label: 'AgentSpec Details', icon: FileCode, category: 'SPEC & GOVERNANCE' }
  ];

  return (
    <aside className="w-64 bg-slate-950/60 backdrop-blur-xl border-r border-slate-800/80 hidden xl:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] shrink-0">
      
      <div className="space-y-6">
        {/* Workspace Info Card */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-200">Orchestrator Status</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Mutagent Helix Agentic Engine Active
          </p>
        </div>

        {/* Menu Section Links */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-700/20 text-white border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine: Single Orchestrator</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>Team Nova • Hackathon 2026</div>
      </div>

    </aside>
  );
}
