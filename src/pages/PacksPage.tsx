import React from 'react';
import { Disc, ShoppingCart, Play, Pause, Music } from 'lucide-react';
import { BeatPack } from '../types';
import { useCart } from '../context/CartContext';
import { useAudio } from '../context/AudioContext';

interface PacksPageProps {
  packs: BeatPack[];
}

export const PacksPage: React.FC<PacksPageProps> = ({ packs }) => {
  const { addToCart, isInCart } = useCart();
  const { currentTrack, isPlaying, playTrack } = useAudio();

  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Beat Packs & Bundles</h1>
        <p className="text-xs text-zinc-400 mt-1">Multi-track beat collections for full projects, mixtapes, and albums</p>
      </div>

      {packs.length === 0 ? (
        <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
          <Disc className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-300 font-display">No Beat Packs Available</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
            The owner can group uploaded beats into Beat Packs inside Creator Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packs.map((pack) => (
            <div key={pack.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <img
                  src={pack.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                  alt={pack.title}
                  className="w-32 h-32 rounded-xl object-cover border border-zinc-800 shrink-0"
                />
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h3 className="text-xl font-bold font-display text-white">{pack.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{pack.description}</p>
                  <div className="flex items-center justify-center sm:justify-between pt-2">
                    <span className="font-mono text-xl font-bold text-purple-400">
                      ${pack.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(pack, 'pack')}
                      disabled={isInCart(pack.id)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isInCart(pack.id) ? 'IN CART' : 'BUY PACK'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracklist Preview */}
              {pack.tracks && pack.tracks.length > 0 && (
                <div className="pt-4 border-t border-zinc-900 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">Included Tracks:</h4>
                  <div className="space-y-1">
                    {pack.tracks.map((tr) => (
                      <div key={tr.id} className="p-2.5 bg-zinc-900/60 rounded-xl flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <Music className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-zinc-200">{tr.title}</span>
                        </div>
                        <span className="text-zinc-500">{tr.bpm} BPM · {tr.key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
