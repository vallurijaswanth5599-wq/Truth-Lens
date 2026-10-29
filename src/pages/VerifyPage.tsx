import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Image as ImageIcon, Video, FileCode, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { InputType, VerificationReport } from '../types';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';

export const VerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InputType>('text');
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      let endpoint = '/verify/text';
      let payload: any = { text: content };

      if (activeTab === 'url') {
        endpoint = '/verify/url';
        payload = { url: content };
      } else if (activeTab === 'image' || activeTab === 'video' || activeTab === 'document') {
        endpoint = `/verify/${activeTab}`;
        payload = {
          file_data: fileData,
          file_name: fileName || 'uploaded_file',
          prompt: content || `Verification request for uploaded ${activeTab}`
        };
      }

      const response = await apiClient.post(endpoint, payload);
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification pipeline encountered an error. Please verify input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Multi-Modality Verification Workspace</h1>
        <p className="text-slate-400 text-sm">Select input modality to run RAG search, media forensics, and Gemini CoT reasoning.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 backdrop-blur-xl">
        {(['text', 'url', 'image', 'video', 'document'] as InputType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'text' && <FileText className="w-4 h-4" />}
            {tab === 'url' && <LinkIcon className="w-4 h-4" />}
            {tab === 'image' && <ImageIcon className="w-4 h-4" />}
            {tab === 'video' && <Video className="w-4 h-4" />}
            {tab === 'document' && <FileCode className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        {activeTab === 'text' || activeTab === 'url' ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {activeTab === 'url' ? 'Target Website / URL' : 'Claim or Statement Text'}
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={activeTab === 'url' ? 'https://example-news-site.com/article' : 'Enter news headline, statement, or claim to verify...'}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload {activeTab} File</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept={activeTab === 'image' ? 'image/*' : activeTab === 'video' ? 'video/*' : '.pdf,.doc,.docx,.txt'}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Optional Context / Claim</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Optional text prompt or statement regarding this file..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Verifying with Tavily Search & Gemini CoT...
            </>
          ) : (
            <>
              Run Full Verification <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {report && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">Verification Complete</span>
              <h2 className="text-2xl font-bold text-white mt-1">{report.recommendation}</h2>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-400">{report.credibilityScore}/100</div>
              <div className="text-xs text-slate-400">Credibility Score</div>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">{report.explanation}</p>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => navigate(`/reports/${report.requestId}`)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl"
            >
              View Full Detailed Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
