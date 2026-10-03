import React, { useState } from 'react';
import { Flame, Sparkles, Plus, CheckCircle, ArrowRight, Tag } from 'lucide-react';
import { Beat, BeatPack } from '../types';

interface PromotionsPageProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  setActiveTab: (tab: string) => void;
}

export const PromotionsPage: React.FC<PromotionsPageProps> = ({ beats, beatPacks, setActiveTab }) => {
  const [promoTitle, setPromoTitle] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([
    {
      id: 'camp-1',
      title: 'Dark Trap Vol. 1 Release Drop',
      type: 'Beat Pack Launch',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    }
  ]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    setCampaigns(prev => [
      {
        id: 'camp-' + Date.now(),
        title: promoTitle,
        type: 'Store Drop',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    setPromoTitle('');
    setPromoMsg('');
  };

  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Promotions & Campaigns Center</h1>
        <p className="text-xs text-zinc-400 mt-1">Organize release drops, promotional banners, and campaign announcements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create Campaign Form */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-lg font-bold font-display text-white">Create Promotional Campaign</h3>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="e.g. Summer Dark Trap Drop"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Promotional Message
              </label>
              <textarea
                value={promoMsg}
                onChange={(e) => setPromoMsg(e.target.value)}
                placeholder="Details about discount or exclusive release..."
                rows={3}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Campaign</span>
            </button>
          </form>
        </div>

        {/* Active Campaigns List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold font-display text-white">Active Campaigns ({campaigns.length})</h3>

          <div className="space-y-3 font-mono text-xs">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{c.title}</h4>
                  <p className="text-zinc-400">{c.type} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 font-bold">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
