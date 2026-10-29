import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, ShieldAlert, AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { benchmarkCases } from '../data/benchmarkCases';

export default function HistoryView({ onSelectCase }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredHistory = benchmarkCases.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.input.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter || item.expectedVerdict.toLowerCase().includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-amber font-mono">History & Saved Reports</span>
              <span className="badge badge-indigo font-mono">{benchmarkCases.length} Ground Truth Logs</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-white mt-2">
              Verification Execution Logs
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Audit historical verifications, inspect evidence chains, or re-run pipeline analyses.
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Search Bar & Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword or claim..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {['all', 'text', 'image', 'audio', 'video', 'url', 'document'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                selectedFilter === filter
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Logs Table / Card List */}
      <div className="space-y-3">
        {filteredHistory.map((log) => {
          const isSafe = log.expectedVerdict === 'Safe to Share';
          const isDanger = log.expectedVerdict === 'Do Not Share';
          const isCaution = log.expectedVerdict === 'Share with Caution';

          return (
            <div
              key={log.id}
              className="glass-card p-4 sm:p-5 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wide">
                    {log.id} • [{log.type.toUpperCase()}]
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">• {log.domain}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 font-display">
                  {log.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                  "{log.input}"
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-slate-800/60 pt-2 md:pt-0">
                <div className="text-right font-mono text-xs">
                  <div className="text-slate-400">Score: <strong className="text-white">{log.expectedCredibility}/100</strong></div>
                  <span className={`badge text-[10px] mt-1 ${isSafe ? 'badge-emerald' : isDanger ? 'badge-rose' : isCaution ? 'badge-amber' : 'badge-purple'}`}>
                    {log.expectedVerdict}
                  </span>
                </div>

                <button
                  onClick={() => onSelectCase(log)}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-400" />
                  Re-Verify
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
