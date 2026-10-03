import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, 
  Volume2, VolumeX, Download, ShoppingCart, Share2, Search, 
  SlidersHorizontal, Music, Disc, Heart
} from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

interface AudioPlayerPageProps {
  beats: Beat[];
  onSelectBeat?: (beat: Beat) => void;
}

export const AudioPlayerPage: React.FC<AudioPlayerPageProps> = ({ beats, onSelectBeat }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, volume, setVolume, currentTime, duration, seek, isFavorite, toggleFavorite } = useAudio();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedMood, setSelectedMood] = useState('All Moods');
  const [bpmFilter, setBpmFilter] = useState(200);
  const [filterTab, setFilterTab] = useState<'beats' | 'kits'>('beats');

  // Filtered beats
  const filteredBeats = beats.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.producer && b.producer.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All Genres' || b.genre === selectedGenre;
    const matchesMood = selectedMood === 'All Moods' || b.mood === selectedMood;
    const matchesBpm = (b.bpm || 140) <= bpmFilter;
    return matchesSearch && matchesGenre && matchesMood && matchesBpm;
  });

  const activeBeat = currentTrack?.originalBeat || filteredBeats[0] || beats[0];

  const handlePlayActive = () => {
    if (!activeBeat) return;
    const playable = {
      id: activeBeat.id,
      title: activeBeat.title,
      producer: activeBeat.producer || 'CASHMERE KID$',
      artworkUrl: activeBeat.artworkUrl || '/src/assets/images/hero_cashmere_kids_1790977501320.jpg',
      audioUrl: activeBeat.audioUrl || '',
      bpm: activeBeat.bpm,
      key: activeBeat.key,
      price: activeBeat.price || 29.99,
      genre: activeBeat.genre,
      originalBeat: activeBeat
    };
    playTrack(playable, filteredBeats.map(b => ({
      id: b.id,
      title: b.title,
      producer: b.producer || 'CASHMERE KID$',
      artworkUrl: b.artworkUrl || '',
      audioUrl: b.audioUrl || '',
      bpm: b.bpm,
      key: b.key,
      price: b.price || 29.99,
      genre: b.genre,
      originalBeat: b
    })));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remain = Math.floor(secs % 60);
    return `${mins}:${remain < 10 ? '0' : ''}${remain}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8 font-sans text-white pb-32">
      
      {/* Top Bar: Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <span>A-Cav Beats Player</span>
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            {filteredBeats.length} Tracks Available
          </span>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search beats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center bg-zinc-950 border border-zinc-900 p-4 rounded-3xl">
        
        {/* Beats / Kits Tabs */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setFilterTab('beats')}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-bold font-mono transition-all ${filterTab === 'beats' ? 'bg-[#1ed760] text-black shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Beats
          </button>
          <button
            onClick={() => setFilterTab('kits')}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-bold font-mono transition-all ${filterTab === 'kits' ? 'bg-[#1ed760] text-black shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            Kits
          </button>
        </div>

        {/* Playlist Selector */}
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#1ed760] appearance-none"
          >
            <option value="All Genres">All Playlists & Genres</option>
            <option value="Trap">Trap</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Dark Trap">Dark Trap</option>
            <option value="R&B">R&B</option>
          </select>
        </div>

        {/* Genre Selector */}
        <div className="relative">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#1ed760] appearance-none"
          >
            <option value="All Genres">All Genres</option>
            <option value="Trap">Trap</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Drill">Drill</option>
          </select>
        </div>

        {/* Mood Selector */}
        <div className="relative">
          <select
            value={selectedMood}
            onChange={e => setSelectedMood(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#1ed760] appearance-none"
          >
            <option value="All Moods">All Moods</option>
            <option value="Aggressive">Aggressive</option>
            <option value="Dark">Dark</option>
            <option value="Ethereal">Ethereal</option>
            <option value="Hype">Hype</option>
          </select>
        </div>

        {/* BPM Slider */}
        <div className="space-y-1 px-2">
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>BPM</span>
            <span>{bpmFilter}</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            value={bpmFilter}
            onChange={e => setBpmFilter(parseInt(e.target.value))}
            className="w-full accent-[#1ed760] bg-zinc-800 h-1 rounded-lg cursor-pointer"
          />
        </div>

      </div>

      {/* Hero Player Section (Matching IMG_3821) */}
      {activeBeat && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
          
          {/* Cover Artwork */}
          <div className="w-48 h-48 md:w-60 md:h-60 shrink-0 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative group">
            <img 
              src={activeBeat.artworkUrl || '/src/assets/images/hero_cashmere_kids_1790977501320.jpg'} 
              alt={activeBeat.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePlayActive}
                className="w-14 h-14 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                {isPlaying && currentTrack?.id === activeBeat.id ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Player Controls & Waveform Info */}
          <div className="flex-1 w-full space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">{activeBeat.title}</h2>
                <p className="text-xs font-mono text-zinc-400 mt-1">
                  Beats • {activeBeat.bpm || 140} BPM • {activeBeat.key || 'C min'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(activeBeat.id)}
                  className={`p-2.5 rounded-xl border transition-all ${isFavorite(activeBeat.id) ? 'bg-rose-950/60 border-rose-800 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite(activeBeat.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Waveform Bar Simulation */}
            <div className="space-y-1.5">
              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = clickX / rect.width;
                  seek(pct * (duration || 180));
                }}
                className="h-12 bg-zinc-900 rounded-xl cursor-pointer flex items-center px-4 gap-1 overflow-hidden border border-zinc-800 relative group"
              >
                {Array.from({ length: 64 }).map((_, i) => {
                  const heightPct = Math.sin(i * 0.3) * 40 + 50;
                  const isPassed = (currentTime / (duration || 180)) * 64 > i;
                  return (
                    <div
                      key={i}
                      style={{ height: `${heightPct}%` }}
                      className={`flex-1 rounded-full transition-colors ${isPassed ? 'bg-[#1ed760]' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 199)}</span>
              </div>
            </div>

            {/* Playback Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => seek(Math.max(0, currentTime - 10))}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  title="Skip back 10s"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handlePlayActive}
                  className="w-12 h-12 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  {isPlaying && currentTrack?.id === activeBeat.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button 
                  onClick={() => seek(Math.min(duration || 180, currentTime + 10))}
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                  title="Skip forward 10s"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center gap-2">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-zinc-400" />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#1ed760] bg-zinc-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Download & Buy CTA */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    addNotification({
                      type: 'system',
                      title: 'Download Request',
                      message: 'Authorized download started for preview stream.'
                    });
                  }}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-2xl font-mono text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(activeBeat, 'beat');
                    addNotification({
                      type: 'order',
                      title: 'Added to Cart',
                      message: `${activeBeat.title} added with Basic Lease.`
                    });
                  }}
                  className="px-6 py-2.5 bg-[#1ed760] hover:bg-[#1ab852] text-black rounded-2xl font-mono text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all hover:scale-105"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy ${(activeBeat.price || 29.99).toFixed(2)}</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Track Listing Table (Matching IMG_3821) */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[11px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950/60">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-4 text-center">BPM</th>
                <th className="py-3.5 px-4 text-center">Key</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 font-sans text-sm">
              {filteredBeats.map((beat, idx) => {
                const isCurrent = currentTrack?.id === beat.id;
                return (
                  <tr 
                    key={beat.id}
                    className={`hover:bg-zinc-900/40 transition-colors group ${isCurrent ? 'bg-zinc-900/70 border-l-2 border-[#1ed760]' : ''}`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-500 group-hover:text-white">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => {
                            playTrack({
                              id: beat.id,
                              title: beat.title,
                              producer: beat.producer || 'CASHMERE KID$',
                              artworkUrl: beat.artworkUrl || '',
                              audioUrl: beat.audioUrl || '',
                              bpm: beat.bpm,
                              key: beat.key,
                              price: beat.price || 29.99,
                              genre: beat.genre,
                              originalBeat: beat
                            });
                          }}
                          className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 shrink-0 relative cursor-pointer group/art"
                        >
                          <img src={beat.artworkUrl || '/src/assets/images/hero_cashmere_kids_1790977501320.jpg'} alt={beat.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 fill-current text-white" />
                          </div>
                        </div>
                        <div>
                          <p className={`font-bold font-display ${isCurrent ? 'text-[#1ed760]' : 'text-white'}`}>{beat.title}</p>
                          <p className="text-xs text-zinc-400">{beat.producer || 'CASHMERE KID$'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-400">
                      {beat.bpm || 140}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-400">
                      {beat.key || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-400">
                      3:09
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => addNotification({ type: 'system', title: 'Download Started', message: `Authorized download for ${beat.title}` })}
                          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                          title="Download preview"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (onSelectBeat) onSelectBeat(beat);
                          }}
                          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            addToCart(beat, 'beat');
                            addNotification({ type: 'order', title: 'Added to Cart', message: `${beat.title} added successfully.` });
                          }}
                          className="p-2 rounded-xl text-[#1ed760] hover:bg-[#1ed760]/20 transition-all font-mono text-xs font-bold flex items-center gap-1 px-3 bg-[#1ed760]/10 border border-[#1ed760]/30"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>${(beat.price || 29.99).toFixed(2)}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
