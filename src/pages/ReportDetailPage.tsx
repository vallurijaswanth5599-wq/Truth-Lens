import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, ArrowLeft, ExternalLink, Download, FileText } from 'lucide-react';
import { VerificationReport } from '../types';
import apiClient from '../services/api';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiClient.get(`/reports/${id}`)
        .then(res => {
          setReport(res.data.report_data || res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading Report Details...</div>;
  }

  if (!report) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-slate-400">Report not found or expired.</div>
        <button onClick={() => navigate('/verify')} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm">
          Return to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400">Report ID: {report.requestId}</span>
            <h1 className="text-3xl font-extrabold text-white mt-1">{report.recommendation}</h1>
            <p className="text-slate-400 text-sm mt-1">{report.domain} • Verified in {report.executionTimeMs}ms</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[120px]">
              <div className="text-3xl font-extrabold text-blue-400">{report.credibilityScore}/100</div>
              <div className="text-xs text-slate-400">Credibility</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[120px]">
              <div className="text-3xl font-extrabold text-indigo-400">{report.confidenceScore}%</div>
              <div className="text-xs text-slate-400">Confidence</div>
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed border-t border-slate-800 pt-6">{report.explanation}</p>
      </div>

      {/* Forensic Vectors if available */}
      {report.forensics && report.forensics.evidenceList && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">Media Forensics & Deepfake Vectors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.forensics.evidenceList.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border text-sm font-medium ${
                item.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                item.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              }`}>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xl font-bold text-white">Retrieved Web Sources</h3>
        <div className="space-y-4">
          {report.sources?.map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-400 hover:underline flex items-center gap-1.5 text-sm">
                  {s.name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">Trust: {s.reliability}/100</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.snippet}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
