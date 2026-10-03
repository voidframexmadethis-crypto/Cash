import React, { useState, useMemo } from 'react';
import { Search, Filter, Play, Pause, ShoppingCart, Download, Share2, SlidersHorizontal, Music, Radio, Compass, Dna, Heart } from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';
import { BeatRadar } from '../components/BeatRadar';
import { BeatNavigator } from '../components/BeatNavigator';
import { BeatDNA } from '../components/BeatDNA';

interface BrowsePageProps {
  beats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const BrowsePage: React.FC<BrowsePageProps> = ({ beats, openBeatDetail }) => {
  const { currentTrack, isPlaying, playTrack, isFavorite, toggleFavorite } = useAudio();
  const { addToCart, isInCart } = useCart();

  const [viewMode, setViewMode] = useState<'grid' | 'radar' | 'navigator'>('grid');
  const [dnaModalBeat, setDnaModalBeat] = useState<Beat | null>(null);

  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedKey, setSelectedKey] = useState('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'priceLow'>('newest');

  const genres = ['All', 'Dark Trap', 'Freestyle Trap', 'Melodic Trap', 'Future Trap', 'Experimental'];
  const moods = ['All', 'Aggressive', 'Dark', 'Ambient', 'Melancholic', 'Energetic', 'Hard'];

  const filteredBeats = useMemo(() => {
    let result = [...beats];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.producer.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter(b => b.genre.toLowerCase() === selectedGenre.toLowerCase());
    }

    if (selectedMood !== 'All') {
      result = result.filter(b => b.mood.toLowerCase() === selectedMood.toLowerCase());
    }

    if (selectedKey !== 'All') {
      result = result.filter(b => b.key === selectedKey);
    }

    if (freeOnly) {
      result = result.filter(b => b.isFree);
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (sortBy === 'priceLow') {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [beats, search, selectedGenre, selectedMood, selectedKey, freeOnly, sortBy]);

  const handleCopyShare = (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#beat-${beatId}`;
    navigator.clipboard.writeText(url);
    alert('Beat link copied!');
  };

  return (
    <div className="space-y-8 pb-28">
      
      {/* Header & View Mode Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">CASHMERE KID$ Beat Discovery</h1>
            <p className="text-xs text-zinc-400 mt-1">Explore luxury trap beats via radar, directional navigator, or catalog grid</p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>CATALOG GRID</span>
            </button>

            <button
              onClick={() => setViewMode('radar')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'radar' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>BEAT RADAR</span>
            </button>

            <button
              onClick={() => setViewMode('navigator')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'navigator' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>BEAT NAVIGATOR</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        {viewMode === 'grid' && (
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by beat title, tag, or vibe..."
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl text-white placeholder-zinc-500 text-sm focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* RADAR VIEW */}
      {viewMode === 'radar' && (
        <BeatRadar beats={beats} openBeatDetail={openBeatDetail} />
      )}

      {/* NAVIGATOR VIEW */}
      {viewMode === 'navigator' && (
        <BeatNavigator
          currentBeat={beats[0] || { id: 'sample', title: 'Beat', bpm: 140, key: 'C Minor', genre: 'Dark Trap', mood: 'Dark' }}
          allBeats={beats}
          openBeatDetail={openBeatDetail}
        />
      )}

      {/* CATALOG GRID VIEW */}
      {viewMode === 'grid' && (
        <>
          {/* Filter Bar */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              
              {/* Genre Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <span className="text-zinc-500 font-mono mr-1">GENRE:</span>
                {genres.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedGenre === g
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Sort selector & Free toggle */}
              <div className="flex items-center gap-4 ml-auto font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-800 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>FREE ONLY</span>
                </label>

                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-xs focus:outline-none"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="popular">Sort: Most Played</option>
                  <option value="priceLow">Sort: Price Low-High</option>
                </select>
              </div>

            </div>
          </div>

          {/* Beats Catalog Grid / List */}
          {filteredBeats.length === 0 ? (
            <div className="py-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
              <Music className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-300 font-display">No beats match your search</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
                Try adjusting your search terms or filters. Upload beats in Command Center.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBeats.map((beat) => {
                const isSelected = currentTrack?.id === beat.id;
                const isPlayingThis = isSelected && isPlaying;
                const isFav = isFavorite(beat.id);

                return (
                  <div
                    key={beat.id}
                    onClick={() => openBeatDetail(beat.id)}
                    className="group bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:bg-zinc-900/40 cursor-pointer"
                  >
                    {/* Artwork & Basic Info */}
                    <div className="flex items-center gap-4 w-full md:w-2/5 min-w-0">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                        <img
                          src={beat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                          alt={beat.title}
                          className="w-full h-full object-cover"
                        />
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
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          {isPlayingThis ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-display truncate group-hover:text-purple-300 transition-colors">
                            {beat.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDnaModalBeat(beat);
                            }}
                            className="text-[10px] font-mono text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800/40 font-bold hover:bg-purple-900"
                            title="View Beat DNA"
                          >
                            DNA
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">{beat.producer}</p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 mt-1">
                          <span className="text-purple-400 font-semibold">{beat.genre}</span>
                          <span>·</span>
                          <span>{beat.mood}</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Specs */}
                    <div className="flex items-center justify-between md:justify-center gap-6 w-full md:w-2/5 text-xs font-mono text-zinc-400">
                      <div className="text-center">
                        <span className="block text-[10px] text-zinc-600">BPM</span>
                        <span className="font-bold text-zinc-200">{beat.bpm}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] text-zinc-600">KEY</span>
                        <span className="font-bold text-zinc-200">{beat.key}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] text-zinc-600">FORMAT</span>
                        <span className="font-bold text-purple-400 uppercase">{beat.format}</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-1/5 shrink-0">
                      <span className="font-mono font-bold text-base text-purple-300">
                        {beat.isFree ? 'FREE' : `$${beat.price.toFixed(2)}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(beat.id);
                          }}
                          className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 bg-zinc-900 transition-colors"
                          title="Favorite"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => handleCopyShare(beat.id, e)}
                          className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 transition-colors"
                          title="Copy Share Link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {beat.isFree ? (
                          <a
                            href={`/api/download/free/${beat.id}`}
                            onClick={(e) => e.stopPropagation()}
                            download
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(beat, 'beat');
                            }}
                            disabled={isInCart(beat.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
        </>
      )}

      {/* Beat DNA Modal */}
      {dnaModalBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setDnaModalBeat(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl"
            >
              <Dna className="w-5 h-5" />
            </button>
            <BeatDNA beat={dnaModalBeat} allBeats={beats} openBeatDetail={openBeatDetail} />
          </div>
        </div>
      )}

    </div>
  );
};
