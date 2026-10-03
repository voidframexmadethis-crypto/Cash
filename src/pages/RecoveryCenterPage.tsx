import React, { useState, useEffect } from 'react';
import { 
  HardDrive, Database, ShieldCheck, AlertCircle, RefreshCw, Download, 
  CheckCircle, FileJson, Server, Activity, ArrowRightLeft 
} from 'lucide-react';

export const RecoveryCenterPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authToken] = useState(() => localStorage.getItem('cashmere_admin_token'));

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/storage/health', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      }
    } catch (err) {
      console.error('Failed to load storage diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleDownloadManifest = async () => {
    try {
      const res = await fetch('/api/admin/storage/manifest', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const manifest = await res.json();
        const jsonStr = JSON.stringify(manifest, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashmere_recovery_manifest_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to download recovery manifest: ' + err);
    }
  };

  return (
    <div className="space-y-8 pb-28 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>STORAGE OS INFRASTRUCTURE</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight mt-1">
            CASHMERE Recovery Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Provider-agnostic asset health diagnostics, orphan detection, and emergency catalog recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDiagnostics}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>RUN DIAGNOSTICS</span>
          </button>

          <button
            onClick={handleDownloadManifest}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 purple-glow"
          >
            <FileJson className="w-4 h-4" />
            <span>EXPORT CATALOG MANIFEST</span>
          </button>
        </div>
      </div>

      {/* Storage Role Providers Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Primary Role */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold uppercase">
              ROLE: PRIMARY
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">LocalStorageProvider</h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">/uploads/audio & /uploads/artwork</p>
          </div>
          <div className="pt-2 text-xs font-mono text-zinc-300 space-y-1 border-t border-zinc-900">
            <p>Provider: <span className="text-purple-400 font-bold">local_primary_audio</span></p>
            <p>Active Objects: <span className="text-white font-bold">{diagnostics?.totalPrimaryObjects || 0}</span></p>
          </div>
        </div>

        {/* Backup Role */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold uppercase">
              ROLE: BACKUP
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">LocalMirrorBackupProvider</h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">/uploads/backups</p>
          </div>
          <div className="pt-2 text-xs font-mono text-zinc-300 space-y-1 border-t border-zinc-900">
            <p>Provider: <span className="text-cyan-400 font-bold">local_mirror_backup</span></p>
            <p>Backup Copies: <span className="text-white font-bold">{diagnostics?.totalBackupObjects || 0}</span></p>
          </div>
        </div>

        {/* Archive Role */}
        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold uppercase">
              ROLE: ARCHIVE
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">LocalArchiveProvider</h3>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">/uploads/archive</p>
          </div>
          <div className="pt-2 text-xs font-mono text-zinc-300 space-y-1 border-t border-zinc-900">
            <p>Provider: <span className="text-amber-400 font-bold">local_archive</span></p>
            <p>Archived Copies: <span className="text-white font-bold">0</span></p>
          </div>
        </div>

      </div>

      {/* Detailed Diagnostic Counters */}
      <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 shadow-2xl">
        <h3 className="text-lg font-bold font-display text-white">Orphan & File Integrity Diagnostics</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 bg-zinc-900/60 rounded-2xl">
            <span className="text-zinc-500 block uppercase">Total Beats</span>
            <span className="text-2xl font-bold text-white mt-1 block">{diagnostics?.totalBeats || 0}</span>
          </div>
          <div className="p-4 bg-zinc-900/60 rounded-2xl">
            <span className="text-zinc-500 block uppercase">Audio Assets</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">{diagnostics?.totalAudioAssets || 0}</span>
          </div>
          <div className="p-4 bg-zinc-900/60 rounded-2xl">
            <span className="text-zinc-500 block uppercase">Missing Files</span>
            <span className={`text-2xl font-bold mt-1 block ${
              (diagnostics?.missingStorageObjects || 0) === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {diagnostics?.missingStorageObjects || 0}
            </span>
          </div>
          <div className="p-4 bg-zinc-900/60 rounded-2xl">
            <span className="text-zinc-500 block uppercase">Orphaned Files</span>
            <span className={`text-2xl font-bold mt-1 block ${
              (diagnostics?.missingDatabaseRecords || 0) === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {diagnostics?.missingDatabaseRecords || 0}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
