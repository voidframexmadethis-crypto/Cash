import React from 'react';
import { Network, Disc, Music, Layers, KeyRound, Play } from 'lucide-react';
import { Beat, Collection, BeatPack } from '../types';
import { useAudio } from '../context/AudioContext';

interface BeatMapProps {
  beats: Beat[];
  collections: Collection[];
  beatPacks: BeatPack[];
  openBeatDetail: (id: string) => void;
}

export const BeatMap: React.FC<BeatMapProps> = ({ beats, collections, beatPacks, openBeatDetail }) => {
  const { playTrack } = useAudio();

  return (
    <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 shadow-2xl font-sans">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <Network className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white">BEAT UNIVERSE MAP</h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Real catalog node relationship map</p>
          </div>
        </div>
      </div>

      {/* Nodes Map Visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {beats.map((beat) => (
          <div
            key={beat.id}
            onClick={() => openBeatDetail(beat.id)}
            className="p-4 bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/80 rounded-2xl space-y-3 cursor-pointer transition-all hover:shadow-xl hover:shadow-purple-950/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                BEAT NODE
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack({
                    id: beat.id,
                    title: beat.title,
                    producer: beat.producer,
                    artworkUrl: beat.artworkUrl,
                    audioUrl: beat.audioUrl,
                    bpm: beat.bpm,
                    key: beat.key,
                    price: beat.price,
                    isFree: beat.isFree,
                    originalBeat: beat
                  });
                }}
                className="p-1.5 rounded-lg bg-purple-600 text-white"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            <h4 className="font-bold text-white font-display text-sm truncate">{beat.title}</h4>
            <p className="text-xs font-mono text-zinc-400">{beat.bpm} BPM · {beat.key} · {beat.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
