import React, { useEffect, useState } from 'react';
import { ShieldAlert, Server, Users, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [flagged, setFlagged] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/admin/users').then(res => setUsers(res.data)).catch(() => {});
    apiClient.get('/admin/system-health').then(res => setHealth(res.data)).catch(() => {});
    apiClient.get('/admin/flagged').then(res => setFlagged(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Admin Operations Console</h1>
        <p className="text-slate-400 text-sm">System monitoring, user audits, and high-risk claim moderation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Server className="w-4 h-4" /> System Health
          </div>
          <div className="text-2xl font-bold text-emerald-400">{health?.status?.toUpperCase() || 'ONLINE'}</div>
          <p className="text-xs text-slate-400">CPU: {health?.cpu_usage_pct}% • RAM: {health?.memory_usage_pct}%</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Users className="w-4 h-4" /> Registered Users
          </div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <p className="text-xs text-slate-400">Active accounts & OAuth providers</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <ShieldAlert className="w-4 h-4" /> Flagged High-Risk
          </div>
          <div className="text-2xl font-bold text-rose-400">{flagged.length}</div>
          <p className="text-xs text-slate-400">Requires review</p>
        </div>
      </div>
    </div>
  );
};
