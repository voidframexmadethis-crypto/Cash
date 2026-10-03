import React, { useState, useEffect } from 'react';
import { KeyRound, Sparkles, Play, Pause, ShoppingCart, Download, ShieldCheck, Lock } from 'lucide-react';
import { Beat, BeatPack } from '../types';
import { fetchVaultData } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

interface VaultPageProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  openBeatDetail: (id: string) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({ openBeatDetail }) => {
  const [vaultBeats, setVaultBeats] = useState<Beat[]>([]);
  const [vaultPacks, setVaultPacks] = useState<BeatPack[]>([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack } = useAudio();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    fetchVaultData()
      .then(data => {
        setVaultBeats(data.beats || []);
        setVaultPacks(data.packs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 pb-28">
      
      {/* Vault Hero Header */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-900/50 bg-gradient-to-br from-zinc-950 via-purple-950/20 to-black p-8 md:p-12 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase">
            <KeyRound className="w-4 h-4 text-purple-400" />
            <span>THE CASHMERE KID$ VAULT</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold font-display text-white tracking-tight">
            Exclusive Unreleased Drops & Special Releases
          </h1>

          <p className="text-sm md:text-base text-zinc-300 font-sans leading-relaxed">
            Reserved exclusively for artists seeking rare sound design, limited beat runs, and unreleased stems.
          </p>
        </div>
      </div>

      {/* Vault Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h2 className="text-2xl font-bold font-display text-white">Vault Unlocked Drops</h2>
          <span className="text-xs font-mono text-purple-400 font-bold">{vaultBeats.length + vaultPacks.length} EXCLUSIVES</span>
        </div>

        {vaultBeats.length === 0 && vaultPacks.length === 0 ? (
          <div className="p-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <Lock className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-300 font-display">The Vault is Currently Sealed</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
              The owner can mark exclusive beats or packs as Vault releases inside Creator Studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultBeats.map((beat) => {
              const isSelected = currentTrack?.id === beat.id;
              const isPlayingThis = isSelected && isPlaying;

              return (
                <div
                  key={beat.id}
                  onClick={() => openBeatDetail(beat.id)}
                  className="bg-zinc-950 border border-purple-900/40 hover:border-purple-500/80 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30 cursor-pointer space-y-4"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900">
                    <img
                      src={beat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                      alt={beat.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-purple-950/90 text-purple-200 border border-purple-700/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                      VAULT EXCLUSIVE
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-display text-white truncate">{beat.title}</h3>
                    <p className="text-xs text-zinc-400 font-mono">{beat.bpm} BPM · {beat.key}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900 font-mono">
                    <span className="text-base font-bold text-purple-300">${beat.price.toFixed(2)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(beat, 'beat');
                      }}
                      disabled={isInCart(beat.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      {isInCart(beat.id) ? 'IN CART' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
