import React, { useState, useMemo } from 'react';
import { 
  Radio, Sliders, Play, Plus, Heart, RotateCcw, Check, Sparkles, Volume2, ShieldCheck 
} from 'lucide-react';
import { Beat } from '../types';
import { useAudio } from '../context/AudioContext';

interface BeatRadarProps {
  beats: Beat[];
  openBeatDetail: (id: string) => void;
}

export const BeatRadar: React.FC<BeatRadarProps> = ({ beats, openBeatDetail }) => {
  const { playTrack, toggleFavorite, isFavorite } = useAudio();

  const [bpmMin, setBpmMin] = useState(120);
  const [bpmMax, setBpmMax] = useState(165);
  const [darknessMin, setDarknessMin] = useState(0);
  const [energyMin, setEnergyMin] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');

  const genres = ['All', 'Dark Trap', 'Freestyle Trap', 'Melodic Trap', 'Future Trap', 'Experimental'];
  const moods = ['All', 'Aggressive', 'Dark', 'Ambient', 'Melancholic', 'Energetic', 'Hard'];

  const radarResults = useMemo(() => {
    return beats.filter(b => {
      if (b.bpm < bpmMin || b.bpm > bpmMax) return false;
      if (selectedGenre !== 'All' && b.genre.toLowerCase() !== selectedGenre.toLowerCase()) return false;
      if (selectedMood !== 'All' && b.mood.toLowerCase() !== selectedMood.toLowerCase()) return false;
      if (b.dna) {
        if (b.dna.darkness && b.dna.darkness < darknessMin) return false;
        if (b.dna.energy && b.dna.energy < energyMin) return false;
      }
      return true;
    });
  }, [beats, bpmMin, bpmMax, darknessMin, energyMin, selectedGenre, selectedMood]);

  const handleReset = () => {
    setBpmMin(120);
    setBpmMax(165);
    setDarknessMin(0);
    setEnergyMin(0);
    setSelectedGenre('All');
    setSelectedMood('All');
  };

  const handlePlayAllResults = () => {
    if (radarResults.length === 0) return;
    const queue = radarResults.map(b => ({
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
    <div className="p-6 md:p-8 bg-gradient-to-br from-zinc-950 via-purple-950/20 to-black border border-purple-900/50 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Radar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
              BEAT RADAR DISCOVERY
            </h2>
            <p className="text-xs text-zinc-400 font-mono">Dynamic multi-dimensional catalog scanner</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={handlePlayAllResults}
            disabled={radarResults.length === 0}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY RADAR MATCHES ({radarResults.length})</span>
          </button>
        </div>
      </div>

      {/* Radar Visual Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
        
        {/* BPM Range Slider */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2">
          <div className="flex justify-between text-zinc-300">
            <span>BPM RANGE</span>
            <span className="text-purple-400 font-bold">{bpmMin} - {bpmMax} BPM</span>
          </div>
          <input
            type="range"
            min={90}
            max={180}
            value={bpmMax}
            onChange={(e) => setBpmMax(parseInt(e.target.value, 10))}
            className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Darkness Intensity */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2">
          <div className="flex justify-between text-zinc-300">
            <span>DARKNESS VIBE</span>
            <span className="text-purple-400 font-bold">{darknessMin}%+</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={10}
            value={darknessMin}
            onChange={(e) => setDarknessMin(parseInt(e.target.value, 10))}
            className="w-full accent-purple-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Genre Selector */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-zinc-300 block">GENRE TARGET</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Mood Selector */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl space-y-2">
          <span className="text-zinc-300 block">MOOD VIBE</span>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

      </div>

      {/* Radar Scanned Results */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase">
          Radar Matches Identified: {radarResults.length}
        </h4>

        {radarResults.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/60 border border-zinc-900 rounded-2xl">
            <p className="text-xs text-zinc-500 font-mono">No beats in catalog match current radar parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {radarResults.map((beat) => (
              <div
                key={beat.id}
                onClick={() => openBeatDetail(beat.id)}
                className="p-3 bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={beat.artworkUrl || ''} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-white font-display truncate">{beat.title}</h5>
                    <p className="text-xs text-purple-300 font-mono">{beat.bpm} BPM · {beat.key}</p>
                  </div>
                </div>

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
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
