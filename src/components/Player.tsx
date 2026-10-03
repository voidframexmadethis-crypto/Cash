import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ShoppingCart, AlertCircle, Loader2, Heart } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

export const Player: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    audioError,
    toggleFavorite,
    isFavorite,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack
  } = useAudio();

  const { addToCart, isInCart } = useCart();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentTrack.originalBeat ? isFavorite(currentTrack.originalBeat.id) : false;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-purple-900/40 shadow-2xl transition-all">
      
      {/* Audio Error Banner if stream fails */}
      {audioError && (
        <div className="bg-rose-950/80 border-b border-rose-800/50 text-rose-200 px-4 py-2 text-xs flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{audioError}</span>
          </div>
        </div>
      )}

      {/* Wide Desktop & Mobile Player Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Track Artwork & Info Section */}
        <div className="flex items-center gap-3 w-full md:w-1/4 shrink-0 min-w-0">
          <img
            src={currentTrack.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
            alt={currentTrack.title}
            className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border border-zinc-800 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate font-display tracking-tight">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate">
              {currentTrack.producer || 'CASHMERE KID$'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
              {currentTrack.bpm && <span>{currentTrack.bpm} BPM</span>}
              {currentTrack.key && <span>· {currentTrack.key}</span>}
              {currentTrack.format && <span className="uppercase text-purple-400">[{currentTrack.format}]</span>}
            </div>
          </div>

          {currentTrack.originalBeat && (
            <button
              onClick={() => toggleFavorite(currentTrack.originalBeat!.id)}
              className="p-2 text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
              title="Favorite Beat"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'text-rose-500 fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Center Player Controls & Waveform Progress Bar */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
          
          {/* Controls buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg purple-glow-sm transition-transform active:scale-95 flex items-center justify-center min-w-[48px] min-h-[48px]"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3 w-full text-xs font-mono text-zinc-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            
            <div className="relative flex-1 group py-2 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <span className="w-10">{formatTime(duration)}</span>
          </div>

        </div>

        {/* Volume & Purchase Action */}
        <div className="flex items-center justify-end gap-4 w-full md:w-1/4 shrink-0">
          
          {/* Volume Control */}
          <div className="hidden lg:flex items-center gap-2 text-zinc-400">
            <button onClick={toggleMute} className="hover:text-white p-1">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* Purchase / Price Tag */}
          {currentTrack.originalBeat && (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-purple-300">
                {currentTrack.isFree ? 'FREE' : `$${currentTrack.price?.toFixed(2)}`}
              </span>
              
              {!currentTrack.isFree && (
                <button
                  onClick={() => currentTrack.originalBeat && addToCart(currentTrack.originalBeat, 'beat')}
                  disabled={isInCart(currentTrack.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[40px] ${
                    isInCart(currentTrack.id)
                      ? 'bg-zinc-800 text-zinc-400 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{isInCart(currentTrack.id) ? 'IN CART' : 'ADD'}</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
