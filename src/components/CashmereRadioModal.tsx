import React, { useState } from 'react';
import { X, Radio, Play, Pause, SkipForward, Heart, ShoppingCart, Disc, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';
import { Beat, RadioMode } from '../types';

interface CashmereRadioModalProps {
  beats: Beat[];
  isOpen: boolean;
  onClose: () => void;
}

export const CashmereRadioModal: React.FC<CashmereRadioModalProps> = ({ beats, isOpen, onClose }) => {
  const { currentTrack, isPlaying, togglePlay, nextTrack, playTrack, isFavorite, toggleFavorite } = useAudio();
  const { addToCart, isInCart } = useCart();

  const [activeMode, setActiveMode] = useState<RadioMode>('DISCOVERY');

  if (!isOpen) return null;

  const getBeatsForMode = (mode: RadioMode) => {
    switch (mode) {
      case 'DARK':
        return beats.filter(b => b.genre.toLowerCase().includes('dark') || b.mood.toLowerCase().includes('dark') || (b.dna?.darkness && b.dna.darkness > 75));
      case 'HARD':
        return beats.filter(b => b.mood.toLowerCase().includes('hard') || b.mood.toLowerCase().includes('aggressive'));
      case 'MELODIC':
        return beats.filter(b => b.genre.toLowerCase().includes('melodic') || (b.dna?.melodicIntensity && b.dna.melodicIntensity > 70));
      case 'CINEMATIC':
        return beats.filter(b => b.genre.toLowerCase().includes('cinematic') || (b.dna?.cinematicIntensity && b.dna.cinematicIntensity > 75));
      case 'VAULT':
        return beats.filter(b => b.isVault);
      case 'DISCOVERY':
      default:
        return beats;
    }
  };

  const handleStartRadioStation = (mode: RadioMode) => {
    setActiveMode(mode);
    const stationBeats = getBeatsForMode(mode);
    if (stationBeats.length === 0) return;

    const queue = stationBeats.map(b => ({
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
    }));

    playTrack(queue[0], queue);
  };

  const radioModes: { id: RadioMode; label: string }[] = [
    { id: 'DISCOVERY', label: 'ALL DISCOVERY' },
    { id: 'DARK', label: 'DARK VIBE' },
    { id: 'HARD', label: 'HARD & AGGRESSIVE' },
    { id: 'MELODIC', label: 'MELODIC TRAP' },
    { id: 'CINEMATIC', label: 'CINEMATIC SCORES' },
    { id: 'VAULT', label: 'THE VAULT RADIO' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in font-sans">
      <div className="w-full max-w-4xl bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 md:p-10 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">CASHMERE RADIO</h2>
              <p className="text-xs text-zinc-400 font-mono">Continuous catalog broadcast stream</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Station Mode Selector */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {radioModes.map((m) => (
            <button
              key={m.id}
              onClick={() => handleStartRadioStation(m.id)}
              className={`px-4 py-2.5 rounded-xl font-bold uppercase transition-all ${
                activeMode === m.id
                  ? 'bg-purple-600 text-white shadow-lg purple-glow'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Currently Broadcasting Canvas */}
        <div className="p-8 bg-gradient-to-r from-purple-950/30 via-zinc-950 to-black border border-zinc-800 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <img
            src={currentTrack?.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
            alt="Broadcasting"
            className="w-48 h-48 rounded-2xl object-cover border-2 border-purple-500/40 shadow-2xl shrink-0"
          />

          <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>LIVE BROADCAST · MODE: {activeMode}</span>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold font-display text-white truncate">
                {currentTrack?.title || 'Radio Offline - Select Mode Above'}
              </h3>
              <p className="text-xs font-mono text-purple-300 mt-1">
                {currentTrack?.producer || 'CASHMERE KID$'} {currentTrack?.bpm ? `· ${currentTrack.bpm} BPM` : ''} {currentTrack?.key ? `· ${currentTrack.key}` : ''}
              </p>
            </div>

            {/* Radio Station Actions */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={togglePlay}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg flex items-center gap-2 purple-glow"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'PAUSE STATION' : 'RESUME STATION'}</span>
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                title="Skip Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
