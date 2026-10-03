import React from 'react';
import { Play, Pause, ShoppingCart, Sparkles, Music, Disc, Layers, Download, Share2, Youtube, Shirt, ArrowRight, KeyRound, Heart } from 'lucide-react';
import { Beat, BeatPack, Collection, MerchItem, YouTubeVideo } from '../types';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  collections: Collection[];
  merch: MerchItem[];
  youtubeVideos: YouTubeVideo[];
  setActiveTab: (tab: string) => void;
  openBeatDetail: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  beats,
  beatPacks,
  collections,
  merch,
  youtubeVideos,
  setActiveTab,
  openBeatDetail
}) => {
  const { currentTrack, isPlaying, playTrack, isFavorite, toggleFavorite } = useAudio();
  const { addToCart, isInCart } = useCart();

  const featuredBeats = beats.filter(b => b.isFeatured).slice(0, 6);
  const recentBeats = [...beats].reverse().slice(0, 6);
  const freeBeats = beats.filter(b => b.isFree).slice(0, 4);
  const vaultBeats = beats.filter(b => b.isVault).slice(0, 3);

  const handleCopyShare = (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#beat-${beatId}`;
    navigator.clipboard.writeText(url);
    alert('Beat link copied to clipboard!');
  };

  return (
    <div className="space-y-20 pb-28">
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[560px] rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl flex items-center justify-center p-6 md:p-12">
        <img
          src="/src/assets/images/hero_cashmere_kids_1790977501320.jpg"
          alt="CASHMERE KID$ Studio"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/50 via-transparent to-black/70" />

        <div className="relative z-10 max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Official CASHMERE KID$ Music Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-white leading-tight text-wrap-balance">
            CASHMERE KID$
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-purple-200 font-display tracking-wide">
            Premium Beats. Original Sound. No Compromise.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
            <button
              onClick={() => setActiveTab('browse')}
              className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase shadow-xl purple-glow transition-all flex items-center gap-2 min-h-[48px]"
            >
              <Music className="w-4 h-4" />
              <span>Browse Beats</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className="px-6 py-3.5 rounded-2xl bg-purple-950/90 hover:bg-purple-900 border border-purple-800 text-purple-200 font-bold text-xs uppercase transition-all flex items-center gap-2 min-h-[48px]"
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Explore The Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className="px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs uppercase transition-all flex items-center gap-2 min-h-[48px]"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Free Beats</span>
            </button>

            <button
              onClick={() => setActiveTab('packs')}
              className="px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs uppercase transition-all flex items-center gap-2 min-h-[48px]"
            >
              <Disc className="w-4 h-4 text-purple-400" />
              <span>Beat Packs</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Beats Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              Featured Beats
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Handpicked underground trap masterpieces</p>
          </div>
          <button
            onClick={() => setActiveTab('browse')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono"
          >
            <span>VIEW ALL ({beats.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredBeats.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950/60 border border-zinc-900 rounded-2xl space-y-2">
            <p className="text-zinc-400 font-mono text-sm">No beats in catalog yet.</p>
            <p className="text-xs text-zinc-600">The store owner can upload new M4A/MP3 beats in Command Center.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBeats.map((beat) => {
              const isSelected = currentTrack?.id === beat.id;
              const isPlayingThis = isSelected && isPlaying;
              const isFav = isFavorite(beat.id);

              return (
                <div
                  key={beat.id}
                  onClick={() => openBeatDetail(beat.id)}
                  className="group bg-zinc-950 border border-zinc-900 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900">
                    <img
                      src={beat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                      alt={beat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                        className="p-4 rounded-full bg-purple-600 text-white shadow-2xl scale-90 group-hover:scale-100 transition-transform"
                      >
                        {isPlayingThis ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                      </button>
                    </div>

                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-purple-300 border border-purple-900/50">
                      {beat.genre}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors truncate">
                        {beat.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(beat.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-current' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 font-sans">{beat.producer}</p>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 pt-1">
                      <span>{beat.bpm} BPM</span>
                      <span>·</span>
                      <span>{beat.key}</span>
                      <span className="uppercase text-purple-400 font-bold ml-auto">{beat.format}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                    <span className="font-mono font-bold text-base text-purple-400">
                      {beat.isFree ? 'FREE' : `$${beat.price.toFixed(2)}`}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleCopyShare(beat.id, e)}
                        className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
                        title="Share Beat"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {beat.isFree ? (
                        <a
                          href={`/api/download/free/${beat.id}`}
                          onClick={(e) => e.stopPropagation()}
                          download
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>FREE</span>
                        </a>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(beat, 'beat');
                          }}
                          disabled={isInCart(beat.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isInCart(beat.id)
                              ? 'bg-zinc-800 text-zinc-400 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-500 text-white'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isInCart(beat.id) ? 'IN CART' : 'ADD'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* The Vault Exclusive Drops Section */}
      {vaultBeats.length > 0 && (
        <section className="p-8 bg-gradient-to-r from-purple-950/40 via-zinc-950 to-black border border-purple-900/40 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-2xl font-extrabold font-display text-white">The Vault Exclusives</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Rare unreleased underground drops</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('vault')} className="text-xs font-mono font-bold text-purple-400 hover:text-purple-300">
              UNLOCK VAULT
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {vaultBeats.map((beat) => (
              <div
                key={beat.id}
                onClick={() => openBeatDetail(beat.id)}
                className="bg-zinc-900/80 border border-purple-800/40 hover:border-purple-500/80 rounded-2xl p-4 cursor-pointer space-y-3"
              >
                <img src={beat.artworkUrl || ''} className="w-full aspect-square rounded-xl object-cover" />
                <h4 className="font-bold text-white font-display truncate">{beat.title}</h4>
                <p className="text-xs font-mono text-purple-300">${beat.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Beat Packs Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              Exclusive Beat Packs
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Multi-track sound bundles for albums and mixtapes</p>
          </div>
          <button
            onClick={() => setActiveTab('packs')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono"
          >
            <span>EXPLORE PACKS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {beatPacks.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/60 border border-zinc-900 rounded-2xl">
            <p className="text-zinc-400 text-sm font-mono">No beat packs published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beatPacks.map((pack) => (
              <div
                key={pack.id}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 hover:border-purple-500/50 transition-all"
              >
                <img
                  src={pack.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                  alt={pack.title}
                  className="w-32 h-32 rounded-xl object-cover border border-zinc-800 shrink-0"
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    {pack.category || 'PACK BUNDLE'}
                  </span>
                  <h3 className="text-xl font-bold font-display text-white">{pack.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{pack.description}</p>
                  <p className="text-xs font-mono text-zinc-500">{pack.tracks.length} Included Tracks</p>
                  <div className="pt-2 flex items-center justify-center sm:justify-between gap-4">
                    <span className="font-mono text-lg font-bold text-purple-300">
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
            ))}
          </div>
        )}
      </section>

      {/* Free Beats Showcase */}
      {freeBeats.length > 0 && (
        <section className="p-8 bg-zinc-950/80 border border-zinc-900 rounded-3xl space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white">Free Downloads</h2>
            <p className="text-xs text-zinc-400 mt-1">Legitimate free beats for non-profit release & practice</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {freeBeats.map((beat) => (
              <div key={beat.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate font-display">{beat.title}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{beat.bpm} BPM · {beat.key}</p>
                </div>
                <a
                  href={`/api/download/free/${beat.id}`}
                  download
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* YouTube & Video Showcase */}
      {youtubeVideos.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-zinc-900 pb-4">
            <h2 className="text-2xl font-extrabold font-display text-white">Studio Videos & Content</h2>
            <p className="text-xs text-zinc-400 mt-1">Watch cookups, beatmaking sessions, and releases</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {youtubeVideos.map((vid) => (
              <div key={vid.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-4 space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${vid.videoId}`}
                    title={vid.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
                <h4 className="font-bold text-sm text-white font-display">{vid.title}</h4>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
