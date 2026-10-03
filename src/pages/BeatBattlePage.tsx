import React, { useState } from 'react';
import { Swords, Play, Pause, Flame, Trophy, ShoppingCart, RefreshCw, Sparkles } from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

interface BeatBattlePageProps {
  beats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const BeatBattlePage: React.FC<BeatBattlePageProps> = ({ beats, openBeatDetail }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { addToCart, isInCart } = useCart();

  const [beatA, setBeatA] = useState<Beat | null>(() => beats[0] || null);
  const [beatB, setBeatB] = useState<Beat | null>(() => beats[1] || null);
  const [winnerStreak, setWinnerStreak] = useState(0);

  if (beats.length < 2) {
    return (
      <div className="p-16 text-center bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3 font-sans">
        <Swords className="w-10 h-10 text-purple-400 mx-auto" />
        <h3 className="text-xl font-bold font-display text-white">Beat Battle Requires 2+ Beats</h3>
        <p className="text-xs text-zinc-400 font-mono">Upload at least two beats to launch head-to-head catalog battles.</p>
      </div>
    );
  }

  const handleSelectWinner = (winner: Beat, loser: Beat) => {
    setWinnerStreak(prev => prev + 1);
    // Winner stays as Beat A, pick a new random challenger for Beat B
    const remaining = beats.filter(b => b.id !== winner.id && b.id !== loser.id);
    const nextChallenger = remaining[Math.floor(Math.random() * remaining.length)] || loser;
    setBeatA(winner);
    setBeatB(nextChallenger);
  };

  const handleShuffleMatchup = () => {
    const shuffled = [...beats].sort(() => 0.5 - Math.random());
    setBeatA(shuffled[0]);
    setBeatB(shuffled[1]);
  };

  return (
    <div className="space-y-8 pb-28 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase mb-2">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>HEAD-TO-HEAD CATALOG DISCOVERY</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">CASHMERE KID$ Beat Battle</h1>
          <p className="text-xs text-zinc-400 mt-1">Audition two beats head-to-head. Pick the winner to build your streak!</p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-4 py-2 bg-purple-950/80 border border-purple-800/50 rounded-xl text-purple-300 font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>STREAK: {winnerStreak} WINS</span>
          </div>

          <button
            onClick={handleShuffleMatchup}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>SHUFFLE MATCHUP</span>
          </button>
        </div>
      </div>

      {/* Head-to-Head Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        
        {/* VS Badge Divider */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-purple-600 text-white font-extrabold font-display text-xl items-center justify-center border-4 border-black shadow-2xl purple-glow">
          VS
        </div>

        {/* BEAT A */}
        {beatA && (
          <div className="p-8 bg-zinc-950 border-2 border-purple-900/60 hover:border-purple-500 rounded-3xl space-y-6 shadow-2xl transition-all relative overflow-hidden group">
            <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-zinc-900">
              <img src={beatA.artworkUrl || ''} className="w-full h-full object-cover" />
              <button
                onClick={() => playTrack({
                  id: beatA.id,
                  title: beatA.title,
                  producer: beatA.producer,
                  artworkUrl: beatA.artworkUrl,
                  audioUrl: beatA.audioUrl,
                  bpm: beatA.bpm,
                  key: beatA.key,
                  price: beatA.price,
                  isFree: beatA.isFree,
                  originalBeat: beatA
                })}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-90 hover:opacity-100 transition-opacity"
              >
                {currentTrack?.id === beatA.id && isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">CONTENDER A</span>
              <h3 className="text-2xl font-extrabold font-display text-white">{beatA.title}</h3>
              <p className="text-xs font-mono text-zinc-400 mt-1">{beatA.bpm} BPM · {beatA.key} · {beatA.genre}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => beatB && handleSelectWinner(beatA, beatB)}
                className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg purple-glow flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>CHOOSE CONTENDER A</span>
              </button>

              <button
                onClick={() => addToCart(beatA, 'beat')}
                disabled={isInCart(beatA.id)}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                title="Add to Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* BEAT B */}
        {beatB && (
          <div className="p-8 bg-zinc-950 border-2 border-purple-900/60 hover:border-purple-500 rounded-3xl space-y-6 shadow-2xl transition-all relative overflow-hidden group">
            <div className="aspect-square w-full rounded-2xl overflow-hidden relative bg-zinc-900">
              <img src={beatB.artworkUrl || ''} className="w-full h-full object-cover" />
              <button
                onClick={() => playTrack({
                  id: beatB.id,
                  title: beatB.title,
                  producer: beatB.producer,
                  artworkUrl: beatB.artworkUrl,
                  audioUrl: beatB.audioUrl,
                  bpm: beatB.bpm,
                  key: beatB.key,
                  price: beatB.price,
                  isFree: beatB.isFree,
                  originalBeat: beatB
                })}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-90 hover:opacity-100 transition-opacity"
              >
                {currentTrack?.id === beatB.id && isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">CONTENDER B</span>
              <h3 className="text-2xl font-extrabold font-display text-white">{beatB.title}</h3>
              <p className="text-xs font-mono text-zinc-400 mt-1">{beatB.bpm} BPM · {beatB.key} · {beatB.genre}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => beatA && handleSelectWinner(beatB, beatA)}
                className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg purple-glow flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>CHOOSE CONTENDER B</span>
              </button>

              <button
                onClick={() => addToCart(beatB, 'beat')}
                disabled={isInCart(beatB.id)}
                className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                title="Add to Cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
