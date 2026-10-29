import React, { useEffect, useState } from 'react';
import { Search, Clock, ArrowRight, Bookmark } from 'lucide-react';
import { VerificationReport } from '../types';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/reports')
      .then(res => {
        setReports(res.data.map((r: any) => r.report_data || r));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter(r => (r.claim || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Verification History</h1>
          <p className="text-slate-400 text-sm">Past claims, media forensics, and fact-checking records.</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading verification records...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/reports/${r.requestId}`)}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <span className="text-xs uppercase font-semibold text-blue-400">{r.domain} • {r.inputType}</span>
                <h3 className="text-lg font-bold text-white leading-snug">{r.claim}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{r.explanation}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">{r.recommendation}</span>
                  <span className="text-xs text-slate-400 font-mono">Credibility: {r.credibilityScore}%</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
