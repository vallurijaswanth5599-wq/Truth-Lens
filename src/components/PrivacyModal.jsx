import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, FileCheck } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full p-6 md:p-8 relative border-indigo-500/30 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              TruthLens Safety & Privacy Directives
            </h2>
            <p className="text-xs text-slate-400">
              Strict ethical boundaries & data protection rules
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-200 mb-0.5">No Unsolicited Monitoring or Background Surveillance</h4>
              <p>TruthLens runs strictly upon explicit user submission through the web interface. No background monitoring or browser history scanning takes place.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <Server className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-200 mb-0.5">Zero Permanent Media Retention</h4>
              <p>Uploaded images, documents, screenshots, and videos are processed in-memory for verification and immediately purged. Content is never used to train commercial models without explicit consent.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-200 mb-0.5">No Third-Party Reporting or Automated Action</h4>
              <p>TruthLens does not automatically publish reports, contact authorities, flag social accounts, or alert third parties. Verification reports are private to the user.</p>
            </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2.5 px-6"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
