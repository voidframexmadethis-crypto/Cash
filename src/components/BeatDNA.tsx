import React from 'react';
import { Sparkles, Dna, ArrowRight, Play, Check } from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';

interface BeatDNAProps {
  beat: Beat;
  allBeats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const BeatDNA: React.FC<BeatDNAProps> = ({ beat, allBeats, openBeatDetail }) => {
  const { playTrack } = useAudio();

  const dna = beat.dna || {
    energy: 80,
    darkness: 85,
    aggression: 90,
    melodicIntensity: 75
  };

  // Metadata Match Engine
  const dnaMatches = allBeats
    .filter(b => b.id !== beat.id)
    .map(b => {
      let matchScore = 0;
      if (b.genre.toLowerCase() === beat.genre.toLowerCase()) matchScore += 40;
      if (Math.abs(b.bpm - beat.bpm) <= 10) matchScore += 30;
      if (b.key.toLowerCase() === beat.key.toLowerCase()) matchScore += 20;
      if (b.mood.toLowerCase() === beat.mood.toLowerCase()) matchScore += 10;
      return { beat: b, matchScore };
    })
    .filter(m => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  return (
    <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6 shadow-xl font-sans">
      
      {/* DNA Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold font-display text-white">BEAT DNA METADATA PROFILE</h3>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800/40 font-bold uppercase">
          Catalog Metadata Match
        </span>
      </div>

      {/* DNA Spec Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 bg-zinc-900/60 rounded-xl">
          <span className="text-zinc-500 text-[10px] block">ENERGY</span>
          <span className="text-sm font-bold text-white">{dna.energy !== undefined ? `${dna.energy}%` : 'Not specified'}</span>
        </div>
        <div className="p-3 bg-zinc-900/60 rounded-xl">
          <span className="text-zinc-500 text-[10px] block">DARKNESS</span>
          <span className="text-sm font-bold text-purple-400">{dna.darkness !== undefined ? `${dna.darkness}%` : 'Not specified'}</span>
        </div>
        <div className="p-3 bg-zinc-900/60 rounded-xl">
          <span className="text-zinc-500 text-[10px] block">AGGRESSION</span>
          <span className="text-sm font-bold text-white">{dna.aggression !== undefined ? `${dna.aggression}%` : 'Not specified'}</span>
        </div>
        <div className="p-3 bg-zinc-900/60 rounded-xl">
          <span className="text-zinc-500 text-[10px] block">MELODIC INTENSITY</span>
          <span className="text-sm font-bold text-purple-300">{dna.melodicIntensity !== undefined ? `${dna.melodicIntensity}%` : 'Not specified'}</span>
        </div>
      </div>

      {/* DNA Match Recommendations */}
      {dnaMatches.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">
            Top Catalog DNA Matches:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dnaMatches.map(({ beat: matchedBeat, matchScore }) => (
              <div
                key={matchedBeat.id}
                onClick={() => openBeatDetail(matchedBeat.id)}
                className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-2 cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{matchScore}% MATCH</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack({
                        id: matchedBeat.id,
                        title: matchedBeat.title,
                        producer: matchedBeat.producer,
                        artworkUrl: matchedBeat.artworkUrl,
                        audioUrl: matchedBeat.audioUrl,
                        bpm: matchedBeat.bpm,
                        key: matchedBeat.key,
                        price: matchedBeat.price,
                        isFree: matchedBeat.isFree,
                        originalBeat: matchedBeat
                      });
                    }}
                    className="p-1 text-purple-400 hover:text-white"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <h5 className="font-bold text-sm text-white font-display truncate">{matchedBeat.title}</h5>
                <p className="text-[11px] font-mono text-zinc-400">{matchedBeat.bpm} BPM · {matchedBeat.key}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
