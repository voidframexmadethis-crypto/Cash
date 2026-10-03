import React, { useState } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Disc, Trash2, Heart, ShoppingCart, Radio } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';
import { Beat } from '../types';

interface SessionModeModalProps {
  beats: Beat[];
  isOpen: boolean;
  onClose: () => void;
}

export const SessionModeModal: React.FC<SessionModeModalProps> = ({ beats, isOpen, onClose }) => {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack, playTrack } = useAudio();
  const { addToCart, isInCart } = useCart();

  const [beatStack, setBeatStack] = useState<Beat[]>(() => beats.slice(0, 5));

  if (!isOpen) return null;

  const removeFromStack = (id: string) => {
    setBeatStack(prev => prev.filter(b => b.id !== id));
  };

  const handlePlayStack = () => {
    if (beatStack.length === 0) return;
    const queue = beatStack.map(b => ({
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in">
      <div className="w-full max-w-5xl h-[90vh] bg-zinc-950 border border-purple-900/50 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden font-sans">
        
        {/* Session Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
            <h2 className="text-xl font-bold font-display text-white tracking-tight">STUDIO SESSION MODE</h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center">
          
          {/* Main Playing Track Showcase */}
          <div className="lg:col-span-7 flex flex-col items-center text-center space-y-6">
            <img
              src={currentTrack?.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
              alt="Artwork"
              className="w-64 h-64 md:w-80 md:h-80 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl purple-glow"
            />

            <div className="space-y-2">
              <h3 className="text-2xl md:text-4xl font-extrabold font-display text-white tracking-tight">
                {currentTrack?.title || 'No Track Playing'}
              </h3>
              <p className="text-sm font-mono text-purple-300">
                {currentTrack?.producer || 'CASHMERE KID$'} {currentTrack?.bpm ? `· ${currentTrack.bpm} BPM` : ''} {currentTrack?.key ? `· ${currentTrack.key}` : ''}
              </p>
            </div>

            {/* Session Controls */}
            <div className="flex items-center gap-6">
              <button onClick={prevTrack} className="p-3 text-zinc-400 hover:text-white">
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-2xl purple-glow"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button onClick={nextTrack} className="p-3 text-zinc-400 hover:text-white">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Right Column: Beat Stack Session */}
          <div className="lg:col-span-5 bg-zinc-900/60 border border-zinc-800 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between font-mono text-xs pb-2 border-b border-zinc-800">
              <span className="font-bold text-white uppercase">SESSION BEAT STACK ({beatStack.length})</span>
              <button onClick={handlePlayStack} className="text-purple-400 font-bold hover:text-purple-300">
                PLAY STACK
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {beatStack.map((b) => (
                <div key={b.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate font-display">{b.title}</p>
                    <p className="text-zinc-500">{b.bpm} BPM · {b.key}</p>
                  </div>
                  <button onClick={() => removeFromStack(b.id)} className="text-zinc-500 hover:text-rose-400 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
