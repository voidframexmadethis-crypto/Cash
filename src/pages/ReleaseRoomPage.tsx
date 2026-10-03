import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, Eye, Rocket, Music, Disc } from 'lucide-react';
import { Beat } from '../types';

interface ReleaseRoomPageProps {
  beats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const ReleaseRoomPage: React.FC<ReleaseRoomPageProps> = ({ beats, openBeatDetail }) => {
  const [selectedBeatId, setSelectedBeatId] = useState<string>(beats[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'checklist' | 'preview'>('checklist');

  const selectedBeat = beats.find(b => b.id === selectedBeatId) || beats[0];

  const checklistItems = selectedBeat ? [
    { label: 'AUDIO SOURCE (M4A/MP3)', status: selectedBeat.audioUrl ? 'READY' : 'MISSING' },
    { label: 'HIGH-RES COVER ARTWORK', status: selectedBeat.artworkUrl ? 'READY' : 'WARNING' },
    { label: 'TITLE & PRODUCER LOCKUP', status: selectedBeat.title ? 'READY' : 'MISSING' },
    { label: 'BPM & KEY CATEGORIZATION', status: selectedBeat.bpm && selectedBeat.key ? 'READY' : 'MISSING' },
    { label: 'GENRE & MOOD TAGS', status: selectedBeat.genre ? 'READY' : 'WARNING' },
    { label: 'BEAT DNA PROFILE', status: selectedBeat.dna ? 'READY' : 'WARNING' },
    { label: 'AUTHORITATIVE PRICING', status: selectedBeat.price ? 'READY' : 'MISSING' },
    { label: 'DOWNLOAD CONFIGURATION', status: selectedBeat.audioUrl ? 'READY' : 'MISSING' }
  ] : [];

  const isReleaseReady = checklistItems.every(item => item.status === 'READY' || item.status === 'WARNING');

  return (
    <div className="space-y-8 pb-28 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">CASHMERE KID$ Release Room</h1>
        <p className="text-xs text-zinc-400 mt-1">Pre-publication checklist & customer storefront preview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Select Beat & Preflight Checklist */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6 shadow-xl">
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-2">Select Beat for Release Preflight</label>
            <select
              value={selectedBeatId}
              onChange={(e) => setSelectedBeatId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 font-sans"
            >
              {beats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.bpm} BPM · {b.key})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs border-b border-zinc-900 pb-2">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg font-bold ${
                activeTab === 'checklist' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              PREFLIGHT CHECKLIST
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold ${
                activeTab === 'preview' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              CUSTOMER PREVIEW
            </button>
          </div>

          {activeTab === 'checklist' && (
            <div className="space-y-3 font-mono text-xs">
              {checklistItems.map((item, i) => (
                <div key={i} className="p-3 bg-zinc-900/60 rounded-xl flex items-center justify-between">
                  <span className="text-zinc-300 font-bold">{item.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'READY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : item.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}

              <div className="pt-4">
                <button
                  disabled={!isReleaseReady}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2 ${
                    isReleaseReady
                      ? 'bg-purple-600 hover:bg-purple-500 text-white purple-glow'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>{isReleaseReady ? 'PUBLISH TO STOREFRONT NOW' : 'BLOCKED - RESOLVE CHECKLIST'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Storefront Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">Live Customer Storefront Preview</h3>

          {!selectedBeat ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl">
              <p className="text-zinc-500 text-xs font-mono">No beat selected for preflight preview.</p>
            </div>
          ) : (
            <div className="p-8 bg-zinc-950 border-2 border-purple-900/60 rounded-3xl space-y-6 shadow-2xl">
              <div className="aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-zinc-900">
                <img src={selectedBeat.artworkUrl || ''} className="w-full h-full object-cover" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-2xl font-extrabold font-display text-white">{selectedBeat.title}</h2>
                <p className="text-xs font-mono text-purple-300">{selectedBeat.bpm} BPM · {selectedBeat.key} · {selectedBeat.genre}</p>
                <p className="text-sm font-mono font-bold text-white pt-2">
                  {selectedBeat.isFree ? 'FREE DOWNLOAD' : `$${selectedBeat.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
