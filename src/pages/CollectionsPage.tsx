import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Collection, Beat } from '../types';

interface CollectionsPageProps {
  collections: Collection[];
  beats: Beat[];
  setActiveTab: (tab: string) => void;
  openBeatDetail: (id: string) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({
  collections,
  beats,
  setActiveTab,
  openBeatDetail
}) => {
  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Sound Collections</h1>
        <p className="text-xs text-zinc-400 mt-1">Categorized beat soundscapes and vibe groupings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const matchedBeats = beats.filter(b => 
            b.genre.toLowerCase().includes(col.slug) || 
            b.subgenre.toLowerCase().includes(col.slug) ||
            col.beatIds.includes(b.id)
          );

          return (
            <div
              key={col.id}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4 hover:border-purple-500/40 transition-all cursor-pointer"
              onClick={() => setActiveTab('browse')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-950/80 border border-purple-800/40 rounded-xl flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">{col.name}</h3>
                  <p className="text-xs font-mono text-zinc-500">{matchedBeats.length} Tracks</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400">{col.description}</p>

              <div className="pt-2 flex items-center justify-between text-xs font-mono text-purple-400 font-semibold">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
