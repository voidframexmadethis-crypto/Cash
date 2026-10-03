import React from 'react';
import { Play, Pause, ShoppingCart, Download, Share2, ArrowLeft, Disc, Music, Tag, Clock, Heart } from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

interface BeatDetailPageProps {
  beat: Beat;
  allBeats: Beat[];
  onBack: () => void;
  openBeatDetail: (id: string) => void;
}

export const BeatDetailPage: React.FC<BeatDetailPageProps> = ({
  beat,
  allBeats,
  onBack,
  openBeatDetail
}) => {
  const { currentTrack, isPlaying, playTrack, isFavorite, toggleFavorite } = useAudio();
  const { addToCart, isInCart } = useCart();

  const isSelected = currentTrack?.id === beat.id;
  const isPlayingThis = isSelected && isPlaying;
  const isFav = isFavorite(beat.id);

  // Smart Recommendation Logic: Match Genre OR BPM proximity (±15 BPM) OR Key/Mood
  const relatedBeats = allBeats
    .filter(b => b.id !== beat.id)
    .map(b => {
      let score = 0;
      if (b.genre.toLowerCase() === beat.genre.toLowerCase()) score += 5;
      if (Math.abs(b.bpm - beat.bpm) <= 15) score += 3;
      if (b.key.toLowerCase() === beat.key.toLowerCase()) score += 2;
      if (b.mood.toLowerCase() === beat.mood.toLowerCase()) score += 2;
      return { beat: b, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => item.beat);

  const handleShare = () => {
    const url = `${window.location.origin}/#beat-${beat.id}`;
    navigator.clipboard.writeText(url);
    alert('Beat link copied to clipboard!');
  };

  return (
    <div className="space-y-12 pb-28">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO CATALOG</span>
      </button>

      {/* Main Beat Showcase Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-zinc-950 border border-zinc-900 p-6 md:p-10 rounded-3xl shadow-2xl">
        
        {/* Artwork */}
        <div className="md:col-span-5 relative group aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
          <img
            src={beat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
            alt={beat.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => playTrack({
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
              })}
              className="p-5 rounded-full bg-purple-600 text-white shadow-2xl scale-95 group-hover:scale-100 transition-transform"
            >
              {isPlayingThis ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </div>
        </div>

        {/* Details & Controls */}
        <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs font-mono font-bold uppercase">
                {beat.genre}
              </span>
              <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 text-xs font-mono uppercase">
                {beat.mood}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
                {beat.title}
              </h1>
              <button
                onClick={() => toggleFavorite(beat.id)}
                className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Favorite"
              >
                <Heart className={`w-6 h-6 ${isFav ? 'text-rose-500 fill-current' : ''}`} />
              </button>
            </div>

            <p className="text-base text-zinc-400 font-medium">Produced by <span className="text-purple-300 font-semibold">{beat.producer}</span></p>

            {beat.description && (
              <p className="text-sm text-zinc-300 font-sans leading-relaxed pt-2">
                {beat.description}
              </p>
            )}

            {/* Spec Matrix */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl font-mono text-center">
              <div>
                <span className="text-[10px] text-zinc-500 block">BPM</span>
                <span className="text-lg font-bold text-white">{beat.bpm}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">KEY</span>
                <span className="text-lg font-bold text-white">{beat.key}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">AUDIO FORMAT</span>
                <span className="text-lg font-bold text-purple-400 uppercase">{beat.format}</span>
              </div>
            </div>

            {/* Tags */}
            {beat.tags && beat.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {beat.tags.map(tag => (
                  <span key={tag} className="text-xs text-zinc-400 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-mono text-zinc-500">AUTHORITATIVE PRICE</span>
              <span className="text-3xl font-extrabold font-mono text-purple-400">
                {beat.isFree ? 'FREE' : `$${beat.price.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {beat.isFree ? (
                <a
                  href={`/api/download/free/${beat.id}`}
                  download
                  className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg purple-glow"
                >
                  <Download className="w-5 h-5" />
                  <span>Free Download</span>
                </a>
              ) : (
                <button
                  onClick={() => addToCart(beat, 'beat')}
                  disabled={isInCart(beat.id)}
                  className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                    isInCart(beat.id)
                      ? 'bg-zinc-800 text-zinc-400 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white purple-glow'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isInCart(beat.id) ? 'IN CART' : 'ADD TO CART'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Smart Related Beats */}
      {relatedBeats.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-extrabold font-display text-white">Smart Recommendations (Matching Genre & BPM)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedBeats.map(rel => (
              <div
                key={rel.id}
                onClick={() => openBeatDetail(rel.id)}
                className="bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 p-4 rounded-2xl space-y-3 cursor-pointer transition-all"
              >
                <img
                  src={rel.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                  alt={rel.title}
                  className="w-full aspect-square rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-white font-display truncate">{rel.title}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{rel.bpm} BPM · {rel.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
