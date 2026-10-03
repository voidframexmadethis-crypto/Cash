import React, { useState } from 'react';
import { Compass, Zap, Flame, Compass as CompassIcon, ArrowRight, Play, Plus } from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';

interface BeatNavigatorProps {
  currentBeat: Beat;
  allBeats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const BeatNavigator: React.FC<BeatNavigatorProps> = ({ currentBeat, allBeats, openBeatDetail }) => {
  const { playTrack } = useAudio();
  const [direction, setDirection] = useState<'faster' | 'darker' | 'heavier' | 'melodic' | 'similar'>('similar');

  const getNavigatedBeats = () => {
    let list = allBeats.filter(b => b.id !== currentBeat.id);

    if (direction === 'faster') {
      list = list.filter(b => b.bpm > currentBeat.bpm).sort((a, b) => a.bpm - b.bpm);
    } else if (direction === 'darker') {
      list = list.filter(b => b.genre.toLowerCase().includes('dark') || b.mood.toLowerCase().includes('dark') || (b.dna?.darkness && b.dna.darkness > 80));
    } else if (direction === 'heavier') {
      list = list.filter(b => b.mood.toLowerCase().includes('hard') || b.mood.toLowerCase().includes('aggressive'));
    } else if (direction === 'melodic') {
      list = list.filter(b => b.genre.toLowerCase().includes('melodic') || (b.dna?.melodicIntensity && b.dna.melodicIntensity > 70));
    } else {
      list = list.filter(b => b.genre === currentBeat.genre || Math.abs(b.bpm - currentBeat.bpm) <= 15);
    }

    return list.slice(0, 4);
  };

  const results = getNavigatedBeats();

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 shadow-xl font-sans">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold font-display text-white">BEAT NAVIGATOR</h3>
        </div>
        <span className="text-xs font-mono text-zinc-400">Directional Catalog Explorer</span>
      </div>

      {/* Navigator Directional Buttons */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        {[
          { id: 'similar', label: 'SIMILAR' },
          { id: 'faster', label: 'FASTER' },
          { id: 'darker', label: 'DARKER' },
          { id: 'heavier', label: 'HEAVIER' },
          { id: 'melodic', label: 'MORE MELODIC' }
        ].map((dir) => (
          <button
            key={dir.id}
            onClick={() => setDirection(dir.id as any)}
            className={`px-4 py-2 rounded-xl font-bold uppercase transition-all ${
              direction === dir.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {dir.label}
          </button>
        ))}
      </div>

      {/* Direction Results */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Directional Navigation Matches ({results.length}):
        </h4>

        {results.length === 0 ? (
          <p className="text-xs text-zinc-500 font-mono py-4">No additional beats match this exact direction in current catalog.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((b) => (
              <div
                key={b.id}
                onClick={() => openBeatDetail(b.id)}
                className="p-3 bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={b.artworkUrl || ''} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-white font-display truncate">{b.title}</h5>
                    <p className="text-xs text-purple-300 font-mono">{b.bpm} BPM · {b.key}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack({
                      id: b.id,
                      title: b.title,
                      producer: b.producer,
                      artworkUrl: b.artworkUrl,
                      audioUrl: b.audioUrl,
                      bpm: b.bpm,
                      key: b.key,
                      price: b.price,
                      isFree: b.isFree,
                      originalBeat: b
                    });
                  }}
                  className="p-2 rounded-xl bg-purple-600 text-white shrink-0"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
